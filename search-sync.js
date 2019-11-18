const fs = require("fs");
const path = require("path");
const hrstart = process.hrtime();

let totalFilesMatched = 0;
let totalFilesScanned = 0;
const performance = process.argv[3];

const walk = dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isFile()) {
      totalFilesScanned++;
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const matched = fileContent.indexOf("TODO") !== -1;
      if (matched && path.extname(filePath) !== ".map") {
        totalFilesMatched++;
        const allTodos = fileContent
          .split("\n")
          .filter(content => content.includes("TODO"));
        console.log("\x1b[33m%s\x1b[0m", filePath);
        allTodos.forEach(todo => console.log("\t", "\x1b[0m", todo.trim()));
      }
    } else if (stat && stat.isDirectory()) {
      walk(filePath);
    }
  });
};

const folder = process.argv[2];
walk(folder);

if (performance) {
  hrend = process.hrtime(hrstart);
  console.log(`Time: ${hrend}`);
  console.log(`Files found: ${totalFilesMatched}`);
  console.log(`Files scanned: ${totalFilesScanned}`);
}
