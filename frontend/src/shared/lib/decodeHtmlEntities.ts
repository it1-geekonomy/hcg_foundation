/**
 * Decodes HTML entities in text taken out of CMS rich-text HTML (the editor stores curly quotes,
 * dashes, etc. as `&rsquo;`, `&#8217;`, …). DOM-free so it also runs during server rendering.
 * Decodes in a single pass, so `&amp;rsquo;` correctly becomes the literal text `&rsquo;`.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ensp: " ",
  emsp: " ",
  thinsp: " ",
  shy: "",
  zwnj: "\u200C",
  zwj: "\u200D",
  lsquo: "\u2018",
  rsquo: "\u2019",
  sbquo: "\u201A",
  ldquo: "\u201C",
  rdquo: "\u201D",
  bdquo: "\u201E",
  laquo: "\u00AB",
  raquo: "\u00BB",
  prime: "\u2032",
  Prime: "\u2033",
  ndash: "\u2013",
  mdash: "\u2014",
  hellip: "\u2026",
  bull: "\u2022",
  middot: "\u00B7",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  deg: "\u00B0",
  times: "\u00D7",
  divide: "\u00F7",
  plusmn: "\u00B1",
  frac12: "\u00BD",
  frac14: "\u00BC",
  frac34: "\u00BE",
  sect: "\u00A7",
  para: "\u00B6",
  euro: "\u20AC",
  pound: "\u00A3",
  cent: "\u00A2",
  yen: "\u00A5",
  iexcl: "\u00A1",
  iquest: "\u00BF",
};

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#\d+|#x[\da-f]+|[a-z][a-z\d]*);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const isHex = entity[1] === "x" || entity[1] === "X";
      const codePoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      const isValid = codePoint > 0 && codePoint <= 0x10ffff && !(codePoint >= 0xd800 && codePoint <= 0xdfff);
      return isValid ? String.fromCodePoint(codePoint) : match;
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}
