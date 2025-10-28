import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { searchProducts } from "./search.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8787;
const products = [];

// load product CSV
import fs from "fs";
import { parse } from "csv-parse/sync";
const csv = fs.readFileSync(new URL("../data/products.csv", import.meta.url));
const records = parse(csv, { columns: true, skip_empty_lines: true });
products.push(...records);

// health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// search route
app.get("/search", (req, res) => {
  const q = req.query.q || "";
  const results = searchProducts(products, q);
  res.json(results);
});

// inventory check by SKU
app.get("/inventory/:sku", (req, res) => {
  const sku = req.params.sku;
  const product = products.find((p) => p.sku === sku);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
