import fs from "fs";
import { parse } from "csv-parse/sync";

const csv = fs.readFileSync(new URL("../data/products.csv", import.meta.url));
const records = parse(csv, { columns: true, skip_empty_lines: true });
console.log(records);
