// ==========================================================
// SHARED CURRENCY UTILITY
// Converts supported budget/spent strings into a numeric value
// expressed in Crores (Indian numbering) for consistent display.
//
// Supported formats (case-insensitive):
//   "₹ 15.0 Cr"   -> 15
//   "15 Cr"        -> 15
//   "15.0"         -> 15        (unitless, small value = crores)
//   "500000"       -> 0.05      (unitless, large value assumed INR -> crores)
//   15             -> 15         (Number)
//   500000 (Number)-> 0.05       (Number, large value assumed INR)
//
// Large unitless values are assumed to be in Indian Rupees and are
// converted to crores by dividing by 1,00,00,000. This prevents
// inconsistent raw values (e.g. "500000") from inflating totals to
// nonsensical amounts like "₹1000117.0 Cr".
// ==========================================================

const RUPEE_TO_CRORE_DIVISOR = 10000000;

// Values at or above this threshold (without an explicit "Cr" unit)
// are treated as raw Indian Rupees rather than crores.
const LARGE_UNITLESS_THRESHOLD = 100000;

const parseAmountToCrores = (amount) => {
  if (amount === null || amount === undefined) return 0;

  // Already a number
  if (typeof amount === "number") {
    if (isNaN(amount)) return 0;
    return amount >= LARGE_UNITLESS_THRESHOLD
      ? amount / RUPEE_TO_CRORE_DIVISOR
      : amount;
  }

  const str = String(amount).trim();
  if (!str) return 0;

  const hasCrUnit = /cr|crore/i.test(str);

  const cleaned = str
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/crore/gi, "")
    .replace(/cr/gi, "")
    .trim();

  const value = parseFloat(cleaned);
  if (isNaN(value)) return 0;

  // An explicit "Cr"/"crore" unit means the value is already in crores
  if (hasCrUnit) return value;

  // Unitless large value -> assume Indian Rupees -> convert to crores
  if (value >= LARGE_UNITLESS_THRESHOLD) {
    return value / RUPEE_TO_CRORE_DIVISOR;
  }

  return value;
};

module.exports = { parseAmountToCrores, RUPEE_TO_CRORE_DIVISOR };
