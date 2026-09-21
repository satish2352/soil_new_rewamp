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
 * The API returns 422 with `message` as a {field: text} map, and otherwise a
 * `{code, message, result}` envelope. Both shapes are normalised here.
 */
async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/${path}`, { method, body, signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new Error('Network error. Please check your connection and try again.');
  }

  const data = await parse(res);

  if (res.status === 422) {
    const msg = data?.message;
    throw new ValidationError(
      msg && typeof msg === 'object' ? msg : {},
      typeof msg === 'string' ? msg : 'Please check the highlighted fields.'
    );
  }
  if (!res.ok) {
    throw new Error(typeof data?.message === 'string' ? data.message : 'Something went wrong.');
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
      // The API answers 400 "…Not Found" for states with no children; that is
      // an empty list, not a failure the user needs to see.
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
