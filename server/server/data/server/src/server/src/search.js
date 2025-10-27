export function searchProducts(products, query) {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.style.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
  );
}
