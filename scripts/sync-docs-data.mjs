import { readFile, writeFile } from "node:fs/promises";

const dataUrl = new URL("../data/vokabeln.json", import.meta.url);
const docsUrl = new URL("../docs/index.html", import.meta.url);

const data = JSON.parse(await readFile(dataUrl, "utf8"));
const html = await readFile(docsUrl, "utf8");
const dataBlock = /const DATA=.*?;\r?\nconst lessons=/s;

if (!dataBlock.test(html)) {
  throw new Error("DATA-Block in docs/index.html wurde nicht gefunden.");
}

const synced = html.replace(dataBlock, `const DATA=${JSON.stringify(data)};\nconst lessons=`);
await writeFile(docsUrl, synced, "utf8");

console.log(`${data.lektionen.length} Lektionen nach docs/index.html synchronisiert.`);
