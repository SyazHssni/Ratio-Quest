// Shared calculations for the interactive learning lab. Inputs are validated at the boundary.
export const gcd = (a, b) => {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) throw new TypeError("GCD needs non-negative whole numbers.");
  let x = a; let y = b;
  while (y) [x, y] = [y, x % y];
  return x;
};

export const simplifyRatio = (a, b) => {
  if (![a, b].every(Number.isFinite) || a < 0 || b < 0) throw new TypeError("Ratio quantities must be non-negative numbers.");
  if (a === 0 && b === 0) return null;
  if (Number.isInteger(a) && Number.isInteger(b)) { const d = gcd(a, b) || 1; return [a / d, b / d]; }
  const scale = 10000; const x = Math.round(a * scale); const y = Math.round(b * scale); const d = gcd(x, y) || 1;
  return [x / d, y / d];
};

export const ratiosEquivalent = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== 2 || b.length !== 2 || [...a, ...b].some((n) => !Number.isFinite(n) || n < 0)) return false;
  if (a[0] === 0 && a[1] === 0 || b[0] === 0 && b[1] === 0) return false;
  return Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-9;
};

export const scaleRatio = (a, b, factor) => {
  if (![a, b, factor].every(Number.isFinite) || a < 0 || b < 0 || factor <= 0) throw new TypeError("Use non-negative quantities and a positive scale factor.");
  return [a * factor, b * factor];
};

export const missingValue = (known, knownPart, targetPart) => {
  if (![known, knownPart, targetPart].every(Number.isFinite) || known < 0 || knownPart <= 0 || targetPart < 0) throw new TypeError("Invalid missing-value relationship.");
  return known * targetPart / knownPart;
};

export const ratioTable = (a, b, rows = 5) => {
  if (![a, b].every(Number.isFinite) || a < 0 || b < 0 || !Number.isInteger(rows) || rows < 1 || rows > 12) throw new TypeError("Invalid ratio table values.");
  return Array.from({ length: rows }, (_, i) => [a * (i + 1), b * (i + 1)]);
};

export const unitRate = (amount, units) => {
  if (![amount, units].every(Number.isFinite) || amount < 0 || units <= 0) return null;
  return amount / units;
};

export const mixHexColours = (hexA, quantityA, hexB, quantityB) => {
  if (![quantityA, quantityB].every(Number.isFinite) || quantityA < 0 || quantityB < 0) return null;
  const total = quantityA + quantityB;
  if (!total) return null;
  const parse = (hex) => hex.match(/[\da-f]{2}/gi).slice(0, 3).map((v) => parseInt(v, 16));
  const a = parse(hexA); const b = parse(hexB);
  const channels = a.map((v, i) => Math.round((v * quantityA + b[i] * quantityB) / total));
  return `#${channels.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
