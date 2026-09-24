/**
 * Site-wide content lifted verbatim from the existing soilchargertechnology.com.
 * Nothing here is authored — every string, number, phone, email and URL was read
 * off the live markup. See docs/AUDIT.md for where each item came from.
 */

export const company = {
  name: 'Soil Charger Technology',
  tagline: "We Are India's Leading Organic Farming Group",
  certification: 'AN ISO 9001:2008 CERTIFIED COMPANY',
  website: 'www.soilchargertechnology.com',
  legacyOrigin: 'https://www.soilchargertechnology.com',
  copyright: '©2026 All rights reserved Soil Charger Technology',
};

export const hero = {
  // Reworded from the live hero's "SOIL Is HEALTHIER, FARMER WALTHIER" — same message, typo fixed.
  titleLines: ['Healthier Soil,', 'Wealthier Farmers'],
  subtitle: "We Are India's Leading Organic Farming Group",
  cta: { label: 'Shop Now', action: 'export-form' },
};

export const contact = {
  address: {
    lines: [
      'Shop No.3, lower ground flow,',
      'below passport office,',
      'star zone mall,',
      'Nashik - Pune highway,',
      'Nashik - 422 101',
    ],
    single:
      'Shop No.3, lower ground flow, below passport office, star zone mall, Nashik - Pune highway, Nashik - 422 101',
    locality: 'Nashik',
    region: 'Maharashtra',
    postalCode: '422 101',
    country: 'IN',
    lat: 19.960683,
    lng: 73.828404,
  },
  phones: [
    { display: '+(91) 8669200221', tel: '+918669200221' },
    { display: '+(91) 9881798028', tel: '+919881798028' },
  ],
  emails: [
    { label: 'For Officials', address: 'soilchargertec@gmail.com' },
    { label: 'For Sales', address: 'salessoiltec1@gmail.com' },
    { label: 'For Careers', address: 'hr.soiltec@gmail.com' },
  ],
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15000.553414257052!2d73.828404!3d19.960683!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x89fda91686ee69ee!2ssoil%20charger%20technology!5e0!3m2!1sen!2sin!4v1650349089176!5m2!1sen!2sin',
};

export const whatsapp = [
  { label: 'SCT Consulting', number: '918669200221' },
  { label: 'SCT Sales', number: '918669950005' },
  { label: 'SCT Management', number: '919545710002' },
];

export const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/Soil.Charger.Technology/', icon: 'facebook' },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/sct_vedic_technology_official/',
    icon: 'instagram',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@SOILCHARGERTECHNOLOGYOFFICIAL',
    icon: 'youtube',
  },
  { label: 'Twitter', href: 'https://twitter.com/GoldenOpportu10', icon: 'twitter' },
];

export const nav = [
  { key: 'home', to: '/' },
  {
    key: 'company',
    children: [
      { key: 'visionMission', to: '/vision-mission' },
      { key: 'about', to: '/about-us' },
      { key: 'team', to: '/our-team' },
    ],
  },
  {
    key: 'gallery',
    to: '/gallery',
    children: [
      { key: 'photoGallery', to: '/gallery?tab=photos' },
      { key: 'videoGallery', to: '/gallery?tab=videos' },
    ],
  },
  { key: 'products', to: '/products' },
  {
    key: 'career',
    to: '/careers',
    children: [
      { key: 'internship', to: '/careers#internship' },
      { key: 'businessRecruitment', to: '/careers#business' },
      { key: 'jobVacancy', to: '/careers#job' },
    ],
  },
  { key: 'blog', to: '/blogs' },
  { key: 'contact', to: '/contact' },
];

/** The four pillar statements, verbatim. Rendered as numbered cards, no art. */
export const pillars = [
  { n: '01', text: 'Work on nourishment not on disease.' },
  { n: '02', text: 'Work on soil not on climate.' },
  { n: '03', text: 'Work on humus not with other things.' },
  { n: '04', text: 'Work on leaf and roots not on fruits' },
];

/**
 * The three principles. `points` are the short list from the section; `detail`
 * is the longer "Important / More Important" text the live site keeps in modals.
 */
export const principles = [
  {
    key: 'first',
    label: 'First',
    title: 'Method',
    badge: 'Important',
    kicker: 'Follow Nutrition',
    lead: 'Understand the meaning of 100% SCT ...',
    points: [
      'Basal dose of krushi amrut , root charger and nutri charger should be given after every 60 days as per requirement of the plant .',
      'In every application of soil or drip or drenching at least once in a week use soil charger 1 ltr and health charger 600 gm for 1 acre .',
      'Each spray must be mixed with a fruit charger.',
    ],
    detail: [
      'A basal dose of krushi amrut, root charger, and Nutri charger should be given after every 60 days as per the requirement of the plant.',
      'In every application of soil or drip or drenching at least once in a week use soil charger 1ltr and health charger 600gm for 1 acre.',
      'Each spray must be mixed with a fruit charger.',
    ],
  },
  {
    key: 'second',
    label: 'Second',
    title: 'Rule',
    badge: 'More Important',
    kicker: 'Avoid Damage',
    lead: 'Things that are strickly prohibited to do. It must be avoided.',
    points: [
      'Do not cultivate any soil that will cause movement or exposure . Mulching should not be done by part of trunk.( weeds should not be cut in rainy weather or when it is raining , do in a dry environment )',
      'Do not use any chemical fertilizer ( granular or water soluble ) .',
      'For crop protection use only pest fighter , pest cleaner , disease fighter and fungi cleaner.',
      'Do not use any chemicals .',
    ],
    detail: [
      'Do not cultivate any soil that will cause movement or exposure. Mulching should not be done by part of trunk. (weeds should not be cut in rainy weather or when it is raining, do in a dry environment)',
      'Do not use any chemical fertilizer. (granular or water-soluble)',
      'For crop protection use only pest fighter, pest cleaner, disease fighter, and fungi cleaner. Do not use any chemicals.',
    ],
  },
  {
    key: 'third',
    label: 'Third',
    title: 'Meditation',
    badge: 'More Important',
    kicker: 'Stay Connected',
    lead: 'This is the breath, water and food for the SCT VEDIC user.',
    points: [
      'Watching daily videos posted on youtube channel and prepare notes and comments. This is the breath of SCT VEDIC.',
      'Study the articles published daily on WhatsApp group. This is the water for SCT VEDIC users.',
      '3 -5 min of daily discussion with at least one new or old user farmer or with each other directly or on call about SCT issue. This is the food for SCT USER',
    ],
    detail: [
      'Watching daily videos posted on the youtube channel and preparing notes and comments. This is the breath of SCT VEDIC.',
      'Study the articles published daily on the WhatsApp group. This is the water for SCT VEDIC users.',
      '3 -5 min of daily discussion with at least one new or old user farmer or with each other directly or on-call about the SCT issue. This is the food for SCT USER',
    ],
  },
];

export const team = [
  { name: 'Aniket Sahane', role: 'Director', image: '/img/team/team1.png' },
  { name: 'Rushikesh Hadwale', role: 'Production Director', image: '/img/team/team2.png' },
  { name: 'Prasad Mukhekar', role: 'Devlopment Director', image: '/img/team/team3.png' },
  { name: 'Arun Patole', role: 'General Manager', image: '/img/team/team4.png' },
  { name: 'Bhausabheb Khemnar', role: 'Technical Expert', image: '/img/team/team5.png' },
];

/**
 * Values read from the live markup's `data-max` attributes. The legacy template
 * also printed a literal " K" after two of these, which made them read as
 * "155,000 K" — the number is preserved exactly, the stray suffix is not.
 */
export const stats = [
  { key: 'farmer', value: 1000000, suffix: '+', label: 'FARMER' },
  { key: 'youtube', value: 155000, suffix: '', label: 'YOUTUBE SUBSCRIBER' },
  { key: 'app', value: 5000, suffix: '', label: 'APP DOWNLOAD' },
  { key: 'seminar', value: 50000, suffix: '', label: 'SEMINAR MEETING' },
  { key: 'distributor', value: 460, suffix: '', label: 'DISTRIBUTOR' },
];

export const iso = {
  heading: 'AN ISO 9001:2008',
  subheading: 'CERTIFIED COMPANY',
  image: '/img/brand/iso.png',
  paragraphs: [
    'At Soil Charger Technologies INC We know our responsibility to offer eco friendly products and services that efficiently satisfy the growing food, fuel, and fodder demands driven by social and economic development in a safe and sustainable manner.',
    'Our company is an leading biotech company who is active in the field of research, manufacturing and marketing of unique organic products for all…',
  ],
};

/** The 10 checkboxes in the existing footer enquiry modal. */
export const enquiryProducts = [
  'Super Soil Charger',
  'Super Fruit Charger',
  'Super Flower Charger',
  'Super Crop Charger',
  'Super Size Charger',
  'Super Water Charger',
  'Super Fungi Charger',
  'Super Pest Charger',
  'Krushi Amrut',
  'Green Gujrat',
];

/** State options with the real state_id values the location API expects. */
export const states = [
  { id: '515914', name: 'Andaman' },
  { id: '109502', name: 'Andrapradesh' },
  { id: '516486', name: 'Arunachal pradesh' },
  { id: '488878', name: 'Assam' },
  { id: '408723', name: 'Bihar' },
  { id: '515640', name: 'Chandigarh' },
  { id: '280883', name: 'Chattisgadh' },
  { id: '522281', name: 'Dadra' },
  { id: '522354', name: 'Daman' },
  { id: '515655', name: 'Delhi' },
  { id: '522384', name: 'Goa' },
  { id: '44341', name: 'Gujrat' },
  { id: '454234', name: 'Hariyana' },
  { id: '461260', name: 'Himachal pradesh' },
  { id: '482091', name: 'Jammu kashmir' },
  { id: '522795', name: 'Jharkhand' },
  { id: '63105', name: 'Karnataka' },
  { id: '555663', name: 'Kerla' },
  { id: '557236', name: 'Lakshadweep' },
  { id: '225388', name: 'Madhya pradesh' },
  { id: '2', name: 'Maharashtra' },
  { id: '557275', name: 'Manipur' },
  { id: '559935', name: 'Meghalaya' },
  { id: '566835', name: 'Mizoram' },
  { id: '567703', name: 'Nagaland' },
  { id: '569264', name: 'Odisha' },
  { id: '621301', name: 'Panjab' },
  { id: '634114', name: 'Puducherry' },
  { id: '180287', name: 'Rajasthan' },
  { id: '634222', name: 'Sikkim' },
  { id: '92884', name: 'Tamilnadu' },
  { id: '92852', name: 'Telangana' },
  { id: '634688', name: 'Tripura' },
  { id: '635638', name: 'Uttarakhand' },
  { id: '301231', name: 'Utterpradesh' },
  { id: '138892', name: 'West Bengol' },
];

/** Products-section intro, verbatim from the live homepage. */
export const productsIntro =
  'Increase the soil fertility and strength of plant. Healthy plant development is our main aim. From last three years our technology experts Mr. Ram Mukhekar ji is educating and train farmers and want to make them independent for treatment and dicisions. Available platform to discuss various problems frankly and searching scientific way to resolve that problem from root.';

/** The single featured video the live homepage links beside the testimonials. */
export const featuredVideo = {
  watchUrl: 'https://www.youtube.com/watch?v=pB5BUEr5mHM&t=1s',
  youtubeId: 'pB5BUEr5mHM',
};
