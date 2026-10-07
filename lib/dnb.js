// ISBN lookup in the Deutsche Nationalbibliothek (German National Library) catalogue.
// Fallback for German-language editions that Google Books doesn't know.
// Free public SRU interface: no key, no quota.

const DNB_SRU = 'https://services.dnb.de/sru/dnb';
const DNB_COVER = 'https://portal.dnb.de/opac/mvb/cover';

// DNB uses ISO 639-2 codes; the app uses two-letter codes like Google Books
const LANGUAGES = { ger: 'de', eng: 'en', fre: 'fr', spa: 'es', ita: 'it' };

const decodeXml = (text) =>
  text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&');

// All values of one Dublin Core element, e.g. every <dc:creator>
const dcValues = (xml, element) =>
  [
    ...xml.matchAll(
      new RegExp(`<dc:${element}[^>]*>([^<]*)</dc:${element}>`, 'g')
    ),
  ].map((match) => decodeXml(match[1]).trim());

// "[Deception game] ; Codewort Tripolis : Thriller / Will Jordan ; aus dem ..."
//   -> { title: 'Codewort Tripolis', subtitle: 'Thriller' }
function parseTitle(raw = '') {
  let text = raw.split(' / ')[0]; // drop "/ author ; translator"
  if (text.startsWith('[')) {
    text = text.slice(text.indexOf(' ; ') + 3); // drop "[original title] ; "
  }
  const [title, ...subtitle] = text.split(' : ');
  return { title: title.trim(), subtitle: subtitle.join(' : ').trim() };
}

// "Jordan, Will [Verfasser]" -> "Will Jordan"; translators etc. are skipped
function parseAuthors(creators) {
  const authors = creators.filter(
    (c) => c.includes('[Verfasser]') || !c.includes('[')
  );
  return authors
    .map((c) => c.replace(/\s*\[[^\]]*\]/g, '').trim())
    .map((name) => {
      const [last, first] = name.split(', ');
      return first ? `${first} ${last}` : last;
    })
    .join(', ');
}

async function coverFor(isbn) {
  const url = `${DNB_COVER}?isbn=${isbn}`;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok ? url : null;
  } catch {
    return null;
  }
}

/**
 * Look up one ISBN. Returns a book in the same shape as lib/googleBooks.js,
 * or null if the DNB has no record. Never throws: it's only a fallback.
 */
export async function searchDnbByISBN(isbn) {
  try {
    const url = `${DNB_SRU}?version=1.1&operation=searchRetrieve&query=num%3D${isbn}&recordSchema=oai_dc&maximumRecords=1`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const xml = await response.text();
    const [rawTitle] = dcValues(xml, 'title');
    if (!rawTitle) return null;

    const { title, subtitle } = parseTitle(rawTitle);
    const [publisherField = ''] = dcValues(xml, 'publisher');
    const [date = ''] = dcValues(xml, 'date');
    const [language = ''] = dcValues(xml, 'language');
    const thumbnail = await coverFor(isbn);

    return {
      googleBooksId: null,
      title: title || 'Unknown Title',
      author: parseAuthors(dcValues(xml, 'creator')) || 'Unknown',
      description: '',
      publishedDate: date,
      publisher: publisherField.split(' : ').pop().trim(), // "München : Blanvalet"
      pageCount: 0,
      categories: '',
      language: LANGUAGES[language] || language || 'de',
      isbn10: isbn.length === 10 ? isbn : null,
      isbn13: isbn.length === 13 ? isbn : null,
      thumbnail,
      coverImage: thumbnail,
      averageRating: 0,
      ratingsCount: 0,
      previewLink: null,
      infoLink: null,
      subtitle,
      maturityRating: 'NOT_MATURE',
    };
  } catch (error) {
    console.warn('DNB lookup failed:', error.message);
    return null;
  }
}
