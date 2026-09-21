/**
 * Language support.
 *
 * The existing site translates through a Google Translate widget, which is the
 * only translation mechanism it has — all CMS content (products, blogs, about)
 * is stored in one language and machine-translated on the fly. That behaviour is
 * preserved so nothing the client currently gets is lost.
 *
 * On top of it, the UI chrome we author here (nav labels, buttons, form labels)
 * ships as real translations, so the frame around the content is correct rather
 * than machine-guessed.
 */
import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

export const LANGS = [
  { code: 'en', label: 'English', google: 'en' },
  { code: 'mr', label: 'Marathi', google: 'mr' },
  { code: 'hi', label: 'HIndi', google: 'hi' }, // label spelled as on the live site
];

const STRINGS = {
  en: {
    'nav.home': 'Home',
    'nav.company': 'Company Profile',
    'nav.visionMission': 'Vision-Mission',
    'nav.about': 'About Us',
    'nav.team': 'Our Team',
    'nav.gallery': 'Gallery',
    'nav.photoGallery': 'Photo Gallery',
    'nav.videoGallery': 'Video Gallery',
    'nav.products': 'Products',
    'nav.career': 'Career',
    'nav.internship': 'Internship',
    'nav.businessRecruitment': 'SCT Business Recruitment',
    'nav.jobVacancy': 'Job Vacancy',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.language': 'Language',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.skip': 'Skip to main content',

    'cta.shopNow': 'Shop Now',
    'cta.readMore': 'Read More',
    'cta.viewMore': 'view more',
    'cta.sendEnquiry': 'Send Enquiry',
    'cta.getInTouch': 'Get In Touch',
    'cta.submit': 'Submit',
    'cta.save': 'Save',
    'cta.cancel': 'CANCEL',
    'cta.back': 'Back',
    'cta.next': 'Next',
    'cta.apply': 'Apply',
    'cta.callUs': 'Call Us',
    'cta.whatsapp': 'WhatsApp',
    'cta.viewAll': 'View all',
    'cta.close': 'Close',

    'section.pillars': '4-piller Of',
    'section.principles': '3-Principle Of',
    'section.about': 'About us',
    'section.vision': 'Vision',
    'section.mission': 'Mission',
    'section.photoGallery': 'Photo Gallery',
    'section.videoGallery': 'Video Gallery',
    'section.products': 'Our Products',
    'section.career': 'CAREER',
    'section.articles': 'Latest News & Articles',
    'section.testimonials': "What Our Farmer's Say",
    'section.team': 'Meet Our Team Members',
    'section.contact': 'Contact',
    'section.usefulLinks': 'Usefull Links',
    'section.website': 'Website',
    'section.mails': 'Mails',
    'section.address': 'Address',
    'section.mobile': 'Mobile',

    'products.all': 'All',
    'products.filter': 'Filter products',
    'products.details': 'Product details',
    'products.additional': 'Additional information',
    'products.enquire': 'Enquire about this product',

    'gallery.photos': 'Photos',
    'gallery.videos': 'Videos',
    'gallery.openImage': 'Open image',
    'gallery.playVideo': 'Play video',
    'gallery.watchOnYoutube': 'Watch on YouTube',

    'blog.readArticle': 'Read article',
    'blog.allArticles': 'All articles',
    'blog.backToBlog': 'Back to all articles',
    'blog.search': 'Search articles',
    'blog.noResults': 'No articles match your search.',

    'career.internship': 'Internship',
    'career.business': 'SCT Business Recruitment',
    'career.job': 'Job Vacancy',
    'career.step': 'Step',
    'career.of': 'of',
    'career.personalDetails': 'Personal Details',
    'career.businessDetails': 'Businees Details',
    'career.requiredDocuments': 'Required Document',
    'career.questions': 'Necessary Questions',
    'career.review': 'Review & submit',

    'form.fullName': 'Full Name',
    'form.email': 'Email',
    'form.mobile': 'Mobile Number',
    'form.qualification': 'Qualification',
    'form.address': 'Address',
    'form.resume': 'Upload Resume',
    'form.experience': 'Previous Experience',
    'form.from': 'From',
    'form.to': 'To',
    'form.firstName': 'First Name',
    'form.middleName': 'Middel Name',
    'form.lastName': 'Last Name',
    'form.altMobile': 'Alternate Mobile Number',
    'form.state': 'State',
    'form.chooseState': 'Choose Your State',
    'form.district': 'District',
    'form.taluka': 'Taluka',
    'form.village': 'Village',
    'form.choose': 'Choose option...',
    'form.select': 'select',
    'form.comment': 'Comment',
    'form.feedback': 'Feedback',
    'form.uploadImage': 'Upload Image',
    'form.uploadVideo': 'Upload Video',
    'form.required': 'This field is required.',
    'form.invalidEmail': 'Enter a valid email address.',
    'form.invalidMobile': 'Enter a valid 10-digit mobile number.',
    'form.fileTooLarge': 'File is larger than 5 MB.',
    'form.sending': 'Sending…',
    'form.success': 'Thanks for contacting us',
    'form.error': 'Something Went Wrong',
    'form.chooseFile': 'Choose file',
    'form.noFile': 'No file chosen',
    'form.selectAtLeastOne': 'Please select at least one product.',

    'enquiry.title': 'ENQUIRY FORM',
    'enquiry.products': 'Products',

    'export.title': 'Export Form',
    'export.companyName': 'Name/Company Name',
    'export.city': 'City',
    'export.country': 'Country',
    'export.pincode': 'Pincode',
    'export.requirements': 'Requirements',

    'testimonial.add': 'ADD TESTIMONIAL',
    'testimonial.previous': 'Previous testimonial',
    'testimonial.next': 'Next testimonial',

    'a11y.loading': 'Loading',
    'a11y.error': 'Could not load this section.',
    'a11y.retry': 'Try again',
  },

  mr: {
    'nav.home': 'मुख्यपृष्ठ',
    'nav.company': 'कंपनी प्रोफाइल',
    'nav.visionMission': 'दृष्टी-ध्येय',
    'nav.about': 'आमच्याविषयी',
    'nav.team': 'आमची टीम',
    'nav.gallery': 'गॅलरी',
    'nav.photoGallery': 'फोटो गॅलरी',
    'nav.videoGallery': 'व्हिडिओ गॅलरी',
    'nav.products': 'उत्पादने',
    'nav.career': 'करिअर',
    'nav.internship': 'इंटर्नशिप',
    'nav.businessRecruitment': 'SCT व्यवसाय भरती',
    'nav.jobVacancy': 'नोकरी रिक्त जागा',
    'nav.blog': 'ब्लॉग',
    'nav.contact': 'संपर्क',
    'nav.language': 'भाषा',
    'nav.menu': 'मेनू',
    'nav.close': 'बंद करा',
    'nav.skip': 'मुख्य मजकुराकडे जा',

    'cta.shopNow': 'आता खरेदी करा',
    'cta.readMore': 'अधिक वाचा',
    'cta.viewMore': 'अधिक पहा',
    'cta.sendEnquiry': 'चौकशी पाठवा',
    'cta.getInTouch': 'संपर्कात रहा',
    'cta.submit': 'सबमिट करा',
    'cta.save': 'जतन करा',
    'cta.cancel': 'रद्द करा',
    'cta.back': 'मागे',
    'cta.next': 'पुढे',
    'cta.apply': 'अर्ज करा',
    'cta.callUs': 'आम्हाला कॉल करा',
    'cta.whatsapp': 'व्हॉट्सॲप',
    'cta.viewAll': 'सर्व पहा',
    'cta.close': 'बंद करा',

    'section.pillars': '४ स्तंभ',
    'section.principles': '३ तत्त्वे',
    'section.about': 'आमच्याविषयी',
    'section.vision': 'दृष्टी',
    'section.mission': 'ध्येय',
    'section.photoGallery': 'फोटो गॅलरी',
    'section.videoGallery': 'व्हिडिओ गॅलरी',
    'section.products': 'आमची उत्पादने',
    'section.career': 'करिअर',
    'section.articles': 'ताज्या बातम्या आणि लेख',
    'section.testimonials': 'आमचे शेतकरी काय म्हणतात',
    'section.team': 'आमच्या टीम सदस्यांना भेटा',
    'section.contact': 'संपर्क',
    'section.usefulLinks': 'उपयुक्त दुवे',
    'section.website': 'वेबसाइट',
    'section.mails': 'ईमेल',
    'section.address': 'पत्ता',
    'section.mobile': 'मोबाइल',

    'products.all': 'सर्व',
    'products.filter': 'उत्पादने फिल्टर करा',
    'products.details': 'उत्पादन तपशील',
    'products.additional': 'अतिरिक्त माहिती',
    'products.enquire': 'या उत्पादनाबद्दल चौकशी करा',

    'gallery.photos': 'फोटो',
    'gallery.videos': 'व्हिडिओ',
    'gallery.openImage': 'प्रतिमा उघडा',
    'gallery.playVideo': 'व्हिडिओ प्ले करा',
    'gallery.watchOnYoutube': 'YouTube वर पहा',

    'blog.readArticle': 'लेख वाचा',
    'blog.allArticles': 'सर्व लेख',
    'blog.backToBlog': 'सर्व लेखांकडे परत',
    'blog.search': 'लेख शोधा',
    'blog.noResults': 'तुमच्या शोधाशी जुळणारे लेख नाहीत.',

    'career.internship': 'इंटर्नशिप',
    'career.business': 'SCT व्यवसाय भरती',
    'career.job': 'नोकरी रिक्त जागा',
    'career.step': 'पायरी',
    'career.of': 'पैकी',
    'career.personalDetails': 'वैयक्तिक तपशील',
    'career.businessDetails': 'व्यवसाय तपशील',
    'career.requiredDocuments': 'आवश्यक कागदपत्रे',
    'career.questions': 'आवश्यक प्रश्न',
    'career.review': 'तपासा आणि सबमिट करा',

    'form.fullName': 'पूर्ण नाव',
    'form.email': 'ईमेल',
    'form.mobile': 'मोबाइल नंबर',
    'form.qualification': 'शैक्षणिक पात्रता',
    'form.address': 'पत्ता',
    'form.resume': 'रेझ्युमे अपलोड करा',
    'form.experience': 'पूर्वीचा अनुभव',
    'form.from': 'पासून',
    'form.to': 'पर्यंत',
    'form.firstName': 'पहिले नाव',
    'form.middleName': 'मधले नाव',
    'form.lastName': 'आडनाव',
    'form.altMobile': 'पर्यायी मोबाइल नंबर',
    'form.state': 'राज्य',
    'form.chooseState': 'तुमचे राज्य निवडा',
    'form.district': 'जिल्हा',
    'form.taluka': 'तालुका',
    'form.village': 'गाव',
    'form.choose': 'पर्याय निवडा...',
    'form.select': 'निवडा',
    'form.comment': 'टिप्पणी',
    'form.feedback': 'अभिप्राय',
    'form.uploadImage': 'प्रतिमा अपलोड करा',
    'form.uploadVideo': 'व्हिडिओ अपलोड करा',
    'form.required': 'हे क्षेत्र आवश्यक आहे.',
    'form.invalidEmail': 'वैध ईमेल पत्ता टाका.',
    'form.invalidMobile': 'वैध १० अंकी मोबाइल नंबर टाका.',
    'form.fileTooLarge': 'फाइल ५ MB पेक्षा मोठी आहे.',
    'form.sending': 'पाठवत आहे…',
    'form.success': 'आमच्याशी संपर्क साधल्याबद्दल धन्यवाद',
    'form.error': 'काहीतरी चूक झाली',
    'form.chooseFile': 'फाइल निवडा',
    'form.noFile': 'फाइल निवडलेली नाही',
    'form.selectAtLeastOne': 'कृपया किमान एक उत्पादन निवडा.',

    'enquiry.title': 'चौकशी फॉर्म',
    'enquiry.products': 'उत्पादने',

    'export.title': 'निर्यात फॉर्म',
    'export.companyName': 'नाव/कंपनीचे नाव',
    'export.city': 'शहर',
    'export.country': 'देश',
    'export.pincode': 'पिनकोड',
    'export.requirements': 'आवश्यकता',

    'testimonial.add': 'अभिप्राय जोडा',
    'testimonial.previous': 'मागील अभिप्राय',
    'testimonial.next': 'पुढील अभिप्राय',

    'a11y.loading': 'लोड होत आहे',
    'a11y.error': 'हा विभाग लोड होऊ शकला नाही.',
    'a11y.retry': 'पुन्हा प्रयत्न करा',
  },

  hi: {
    'nav.home': 'होम',
    'nav.company': 'कंपनी प्रोफ़ाइल',
    'nav.visionMission': 'दृष्टि-मिशन',
    'nav.about': 'हमारे बारे में',
    'nav.team': 'हमारी टीम',
    'nav.gallery': 'गैलरी',
    'nav.photoGallery': 'फोटो गैलरी',
    'nav.videoGallery': 'वीडियो गैलरी',
    'nav.products': 'उत्पाद',
    'nav.career': 'करियर',
    'nav.internship': 'इंटर्नशिप',
    'nav.businessRecruitment': 'SCT व्यवसाय भर्ती',
    'nav.jobVacancy': 'नौकरी रिक्ति',
    'nav.blog': 'ब्लॉग',
    'nav.contact': 'संपर्क',
    'nav.language': 'भाषा',
    'nav.menu': 'मेन्यू',
    'nav.close': 'बंद करें',
    'nav.skip': 'मुख्य सामग्री पर जाएं',

    'cta.shopNow': 'अभी खरीदें',
    'cta.readMore': 'और पढ़ें',
    'cta.viewMore': 'और देखें',
    'cta.sendEnquiry': 'पूछताछ भेजें',
    'cta.getInTouch': 'संपर्क करें',
    'cta.submit': 'सबमिट करें',
    'cta.save': 'सहेजें',
    'cta.cancel': 'रद्द करें',
    'cta.back': 'पीछे',
    'cta.next': 'आगे',
    'cta.apply': 'आवेदन करें',
    'cta.callUs': 'हमें कॉल करें',
    'cta.whatsapp': 'व्हाट्सऐप',
    'cta.viewAll': 'सभी देखें',
    'cta.close': 'बंद करें',

    'section.pillars': '४ स्तंभ',
    'section.principles': '३ सिद्धांत',
    'section.about': 'हमारे बारे में',
    'section.vision': 'दृष्टि',
    'section.mission': 'मिशन',
    'section.photoGallery': 'फोटो गैलरी',
    'section.videoGallery': 'वीडियो गैलरी',
    'section.products': 'हमारे उत्पाद',
    'section.career': 'करियर',
    'section.articles': 'नवीनतम समाचार और लेख',
    'section.testimonials': 'हमारे किसान क्या कहते हैं',
    'section.team': 'हमारी टीम से मिलिए',
    'section.contact': 'संपर्क',
    'section.usefulLinks': 'उपयोगी लिंक',
    'section.website': 'वेबसाइट',
    'section.mails': 'ईमेल',
    'section.address': 'पता',
    'section.mobile': 'मोबाइल',

    'products.all': 'सभी',
    'products.filter': 'उत्पाद फ़िल्टर करें',
    'products.details': 'उत्पाद विवरण',
    'products.additional': 'अतिरिक्त जानकारी',
    'products.enquire': 'इस उत्पाद के बारे में पूछताछ करें',

    'gallery.photos': 'फोटो',
    'gallery.videos': 'वीडियो',
    'gallery.openImage': 'छवि खोलें',
    'gallery.playVideo': 'वीडियो चलाएं',
    'gallery.watchOnYoutube': 'YouTube पर देखें',

    'blog.readArticle': 'लेख पढ़ें',
    'blog.allArticles': 'सभी लेख',
    'blog.backToBlog': 'सभी लेखों पर वापस',
    'blog.search': 'लेख खोजें',
    'blog.noResults': 'आपकी खोज से मेल खाने वाले लेख नहीं हैं।',

    'career.internship': 'इंटर्नशिप',
    'career.business': 'SCT व्यवसाय भर्ती',
    'career.job': 'नौकरी रिक्ति',
    'career.step': 'चरण',
    'career.of': 'में से',
    'career.personalDetails': 'व्यक्तिगत विवरण',
    'career.businessDetails': 'व्यवसाय विवरण',
    'career.requiredDocuments': 'आवश्यक दस्तावेज़',
    'career.questions': 'आवश्यक प्रश्न',
    'career.review': 'जांचें और सबमिट करें',

    'form.fullName': 'पूरा नाम',
    'form.email': 'ईमेल',
    'form.mobile': 'मोबाइल नंबर',
    'form.qualification': 'योग्यता',
    'form.address': 'पता',
    'form.resume': 'रिज्यूमे अपलोड करें',
    'form.experience': 'पिछला अनुभव',
    'form.from': 'से',
    'form.to': 'तक',
    'form.firstName': 'पहला नाम',
    'form.middleName': 'मध्य नाम',
    'form.lastName': 'उपनाम',
    'form.altMobile': 'वैकल्पिक मोबाइल नंबर',
    'form.state': 'राज्य',
    'form.chooseState': 'अपना राज्य चुनें',
    'form.district': 'जिला',
    'form.taluka': 'तालुका',
    'form.village': 'गांव',
    'form.choose': 'विकल्प चुनें...',
    'form.select': 'चुनें',
    'form.comment': 'टिप्पणी',
    'form.feedback': 'प्रतिक्रिया',
    'form.uploadImage': 'छवि अपलोड करें',
    'form.uploadVideo': 'वीडियो अपलोड करें',
    'form.required': 'यह फ़ील्ड आवश्यक है।',
    'form.invalidEmail': 'मान्य ईमेल पता दर्ज करें।',
    'form.invalidMobile': 'मान्य १० अंकों का मोबाइल नंबर दर्ज करें।',
    'form.fileTooLarge': 'फ़ाइल ५ MB से बड़ी है।',
    'form.sending': 'भेजा जा रहा है…',
    'form.success': 'हमसे संपर्क करने के लिए धन्यवाद',
    'form.error': 'कुछ गलत हो गया',
    'form.chooseFile': 'फ़ाइल चुनें',
    'form.noFile': 'कोई फ़ाइल नहीं चुनी',
    'form.selectAtLeastOne': 'कृपया कम से कम एक उत्पाद चुनें।',

    'enquiry.title': 'पूछताछ फॉर्म',
    'enquiry.products': 'उत्पाद',

    'export.title': 'निर्यात फॉर्म',
    'export.companyName': 'नाम/कंपनी का नाम',
    'export.city': 'शहर',
    'export.country': 'देश',
    'export.pincode': 'पिनकोड',
    'export.requirements': 'आवश्यकताएं',

    'testimonial.add': 'प्रतिक्रिया जोड़ें',
    'testimonial.previous': 'पिछली प्रतिक्रिया',
    'testimonial.next': 'अगली प्रतिक्रिया',

    'a11y.loading': 'लोड हो रहा है',
    'a11y.error': 'यह अनुभाग लोड नहीं हो सका।',
    'a11y.retry': 'पुनः प्रयास करें',
  },
};

const STORAGE_KEY = 'sct-lang';
const I18nContext = createContext(null);

/** Drives the Google Translate widget that already powers the live site. */
function setGoogleTranslate(code) {
  if (typeof document === 'undefined') return;
  // The widget round-trips through a cookie read by its own script.
  const value = code === 'en' ? '/en/en' : `/en/${code}`;
  const host = window.location.hostname;
  const domains = ['', `; domain=${host}`, `; domain=.${host.replace(/^www\./, '')}`];
  domains.forEach((d) => {
    document.cookie = `googtrans=${value}; path=/${d}`;
  });

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = code === 'en' ? '' : code;
    select.dispatchEvent(new Event('change'));
  }
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return LANGS.some((l) => l.code === stored) ? stored : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((code) => {
    setLangState(code);
    setGoogleTranslate(code);
  }, []);

  const t = useCallback(
    (key, fallback) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? fallback ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, langs: LANGS }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
