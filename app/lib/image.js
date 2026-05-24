// Cloudinary URL helper: inserts transformations after /upload/.
// Non-Cloudinary URLs pass through unchanged.
const CLOUDINARY_RE = /res\.cloudinary\.com\/.+\/image\/upload\//;

export const cld = (url, opts = {}) => {
  if (!url || typeof url !== "string") return url;
  if (!CLOUDINARY_RE.test(url)) return url;
  // Don't double-transform if caller already inserted params.
  if (/\/upload\/[a-z]_/.test(url)) return url;

  const t = [];
  if (opts.w) t.push(`w_${opts.w}`);
  if (opts.h) t.push(`h_${opts.h}`);
  if (opts.crop) t.push(`c_${opts.crop}`);
  t.push("f_auto", "q_auto");
  return url.replace("/upload/", `/upload/${t.join(",")}/`);
};

// Common presets so we don't repeat magic numbers
export const cldThumb = (url) => cld(url, { w: 200, crop: "fill" });
export const cldCard = (url) => cld(url, { w: 600, crop: "fill" });
export const cldHero = (url) => cld(url, { w: 1200 });
