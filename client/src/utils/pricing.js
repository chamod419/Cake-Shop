export function parseWeightKg(sizeLabel) {
  if (!sizeLabel) return 1;
  const m = String(sizeLabel).match(/([\d.]+)\s*kg/i);
  const kg = m ? Number(m[1]) : 1;
  return Number.isFinite(kg) && kg > 0 ? kg : 1;
}

export function calcUnitPrice(product, sizeLabel) {
  // product.price = 1kg price
  const kg = parseWeightKg(sizeLabel);
  const base = Number(product?.price ?? 0);
  const val = base * kg;

  // round to nearest rupee
  return Math.round(val);
}

export function money(amount) {
  const n = Number(amount ?? 0);
  return `Rs. ${Math.round(n).toLocaleString()}`;
}
