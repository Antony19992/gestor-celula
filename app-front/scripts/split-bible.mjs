import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/biblia");

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log("Baixando acf.json do GitHub...");

const url =
  "https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json";

https.get(url, (res) => {
  const chunks = [];
  res.on("data", (c) => chunks.push(c));
  res.on("end", () => {
    const raw = Buffer.concat(chunks).toString("utf8").replace(/^﻿/, "");
    let bible;
    try {
      bible = JSON.parse(raw);
    } catch (e) {
      console.error("Erro ao parsear JSON:", e.message);
      process.exit(1);
    }

    console.log(`Total de livros: ${bible.length}`);

    for (const book of bible) {
      const file = path.join(OUT_DIR, `${book.abbrev}.json`);
      fs.writeFileSync(file, JSON.stringify(book.chapters), "utf8");
      process.stdout.write(`  ✓ ${book.abbrev}.json\n`);
    }

    console.log(`\nPronto! ${bible.length} arquivos em public/biblia/`);
  });
}).on("error", (e) => {
  console.error("Erro na requisição:", e.message);
  process.exit(1);
});
