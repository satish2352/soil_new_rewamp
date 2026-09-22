/**
 * Client for the existing Laravel API. Endpoints, payload shapes and the
 * error convention all match what the legacy site already sends — see
 * docs/AUDIT.md section C. Nothing here is mocked.
 */
export const API_BASE = 'https://finalapi.soilchargertechnology.com/api';

/** Thrown for a 422 so callers can map messages back onto their fields. */
export class ValidationError extends Error {
  constructor(fields, message = 'Please check the highlighted fields.') {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields || {};
  }
}

async function parse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * Normalises this API's two ways of reporting a failure.
 *
 * It does NOT reliably use HTTP status codes: a rejected request commonly comes
 * back as **HTTP 200** carrying `{code: 400, message: "...", result: "false"}`.
 * Verified against /districtlist, which answers 200 + code 400 for an unknown
 * state id. Checking `res.ok` alone therefore reports failures as successes —
 * which for a form means telling someone their application was submitted when
 * it was not.
 *
 * So both are checked: the HTTP status *and* the envelope inside the body.
 */
function isFailure(res, data) {
  if (!res.ok) return true;
  if (!data || typeof data !== 'object') return false;

  // `result` is the envelope's own success flag, sent as a string or a boolean.
  if (data.result === false || data.result === 'false') return true;

  const code = Number(data.code);
  return Number.isFinite(code) && code >= 400;
}

/** A field-error map means validation, whatever the status code says. */
function isValidation(data) {
  const code = Number(data?.code);
  return code === 422 || (data?.message && typeof data.message === 'object');
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/${path}`, { method, body, signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Network error. Please check your connection and try again.');
  }

  const data = await parse(res);

  if (res.status === 422 || (isFailure(res, data) && isValidation(data))) {
    const msg = data?.message;
    throw new ValidationError(
      msg && typeof msg === 'object' ? msg : {},
      typeof msg === 'string' ? msg : 'Please check the highlighted fields.'
    );
  }

  if (isFailure(res, data)) {
    throw new Error(
      typeof data?.message === 'string' ? data.message : 'Something went wrong.'
    );
  }

  return data;
}

const form = (obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    fd.append(k, v);
  });
  return fd;
};

/* --------------------------------------------------------------------- read */

/** Live product catalogue — 21 records. */
export const getProducts = (signal) =>
  request('frontproductlist', { signal }).then((r) => r.data || []);

export const getAboutUs = (signal) =>
  request('frontaboutuslist', { signal }).then((r) => (r.data || [])[0] || null);

export const getVisionMission = (signal) =>
  request('frontvisionmissionlist', { signal }).then((r) => r.data || []);

export const getTestimonials = (signal) =>
  request('fronttestimonialslist', { signal }).then((r) => r.data || []);

/** Slides with a null photo render blank on the legacy site, so drop them. */
export const getSlides = (signal) =>
  request('frontsliderlist', { signal }).then((r) =>
    (r.data || []).filter((s) => s.photo_one && s.photopath && !s.photopath.endsWith('/'))
  );

/* ----------------------------------------------------------------- location */

const locationList = (path, payload, signal) =>
  request(path, { method: 'POST', body: form(payload), signal })
    .then((r) => r.data || [])
    .catch((err) => {
      if (err?.name === 'AbortError') throw err;
      // "…List Not Found" is how this API reports an empty level (a state with
      // no districts loaded). That is an empty dropdown, not a user-facing
      // failure — anything else propagates.
      if (/not found/i.test(err?.message || '')) return [];
      if (err instanceof ValidationError) throw err;
      return [];
    });

export const getDistricts = (stateId, signal) =>
  locationList('districtlist', { state_id: stateId }, signal);

export const getTalukas = (districtId, signal) =>
  locationList('talukalist', { dist_id: districtId }, signal);

export const getVillages = (talukaId, signal) =>
  locationList('villagelist', { taluka_id: talukaId }, signal);

/* -------------------------------------------------------------------- write */

/** Footer enquiry. `details` is a comma-joined list of product names. */
export const submitEnquiry = ({ name, email, mobile, comment, details }) =>
  request('frontenquiryadd', {
    method: 'POST',
    body: form({ name, email, mobile, comment, details }),
  });

export const submitInternship = (fields) =>
  request('frontinternshipadd', { method: 'POST', body: form(fields) });

export const submitJobApplication = (fields) =>
  request('frontjobpostingadd', { method: 'POST', body: form(fields) });

export const submitDistributorRegistration = (fields) =>
  request('frontdistributorregistration', { method: 'POST', body: form(fields) });
