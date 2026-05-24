export const formatPrice = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const truncate = (str, n = 60) => {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
};
