import { getLocales } from 'expo-localization';

/**
 * Gets the appropriate Amazon domain based on device locale
 * @returns {string} Amazon domain (e.g., amazon.com, amazon.co.uk)
 */
export const getAmazonDomain = () => {
  const locales = getLocales();
  const countryCode = locales[0]?.regionCode?.toLowerCase() || 'us';

  const amazonDomains = {
    // Americas
    us: 'amazon.com',
    ca: 'amazon.ca',
    mx: 'amazon.com.mx',
    br: 'amazon.com.br',

    // Europe - Major Amazon stores
    gb: 'amazon.co.uk',
    de: 'amazon.de',
    fr: 'amazon.fr',
    it: 'amazon.it',
    es: 'amazon.es',
    nl: 'amazon.nl',
    pl: 'amazon.pl',
    se: 'amazon.se',
    tr: 'amazon.com.tr',

    // European countries that use German Amazon
    at: 'amazon.de', // 🔥 Austria uses German Amazon
    ch: 'amazon.de', // Switzerland (German-speaking) uses German Amazon
    li: 'amazon.de', // Liechtenstein uses German Amazon
    lu: 'amazon.de', // Luxembourg uses German Amazon

    // European countries that use UK Amazon
    ie: 'amazon.co.uk', // Ireland uses UK Amazon

    // European countries that use French Amazon
    be: 'amazon.fr', // Belgium (French-speaking) uses French Amazon
    mc: 'amazon.fr', // Monaco uses French Amazon

    // European countries that use Italian Amazon
    sm: 'amazon.it', // San Marino uses Italian Amazon
    va: 'amazon.it', // Vatican uses Italian Amazon

    // European countries that use Spanish Amazon
    ad: 'amazon.es', // Andorra uses Spanish Amazon
    pt: 'amazon.es', // Portugal often uses Spanish Amazon

    // Nordic countries that use Swedish Amazon
    no: 'amazon.se', // Norway uses Swedish Amazon
    dk: 'amazon.se', // Denmark uses Swedish Amazon
    fi: 'amazon.se', // Finland uses Swedish Amazon
    is: 'amazon.se', // Iceland uses Swedish Amazon

    // Other European countries default to German Amazon (largest EU market)
    cz: 'amazon.de', // Czech Republic
    sk: 'amazon.de', // Slovakia
    hu: 'amazon.de', // Hungary
    si: 'amazon.de', // Slovenia
    hr: 'amazon.de', // Croatia
    bg: 'amazon.de', // Bulgaria
    ro: 'amazon.de', // Romania
    ee: 'amazon.de', // Estonia
    lv: 'amazon.de', // Latvia
    lt: 'amazon.de', // Lithuania
    mt: 'amazon.de', // Malta
    cy: 'amazon.de', // Cyprus

    // Middle East & Africa
    ae: 'amazon.ae',
    sa: 'amazon.sa',
    eg: 'amazon.ae', // Egypt uses UAE Amazon
    kw: 'amazon.ae', // Kuwait uses UAE Amazon
    qa: 'amazon.ae', // Qatar uses UAE Amazon
    bh: 'amazon.ae', // Bahrain uses UAE Amazon
    om: 'amazon.ae', // Oman uses UAE Amazon
    jo: 'amazon.ae', // Jordan uses UAE Amazon
    lb: 'amazon.ae', // Lebanon uses UAE Amazon

    // Asia Pacific
    in: 'amazon.in',
    jp: 'amazon.co.jp',
    cn: 'amazon.cn',
    au: 'amazon.com.au',
    nz: 'amazon.com.au', // New Zealand uses Australian Amazon
    sg: 'amazon.sg',

    // Asian countries that typically use Singapore Amazon
    my: 'amazon.sg', // Malaysia
    th: 'amazon.sg', // Thailand
    ph: 'amazon.sg', // Philippines
    id: 'amazon.sg', // Indonesia
    vn: 'amazon.sg', // Vietnam
    hk: 'amazon.sg', // Hong Kong
    tw: 'amazon.sg', // Taiwan
    kr: 'amazon.sg', // South Korea (until they get their own)
  };

  const domain = amazonDomains[countryCode] || 'amazon.com';

  return domain;
};

/**
 * Creates an Amazon search URL for a book
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @returns {string} Amazon search URL
 */
export const getAmazonSearchUrl = (title, author) => {
  const amazonDomain = getAmazonDomain();
  const searchQuery = `${encodeURIComponent(title)} ${encodeURIComponent(
    author
  )}`;
  return `https://www.${amazonDomain}/s?k=${searchQuery}`;
};
