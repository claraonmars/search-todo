const fs = require("fs");
const path = require("path");
const MAX_LOAD = 200;

// for perfomance tracking
const performance = process.argv[3];
const hrstart = process.hrtime();
let hrend = 0;
let totalFilesMatched = 0;
let totalFilesScanned = 0;

const startingFolder = process.argv[2];

let totalFiles = 0;
let currentFileCount = 0;

// prints loading bar
const printProgress = currentFile => {
  const loadedFiles = (50 / totalFiles) * currentFile;

  if (loadedFiles < currentFileCount) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      "Loading:" +
        "[" +
        "-".repeat(Math.ceil(loadedFiles)) +
        " ".repeat(50 - Math.floor(loadedFiles)) +
        "]"
    );
  }
  currentFileCount = loadedFiles;
};

// returns all directories
const walk = (dir, complete) => {
  let results = [];
  fs.readdir(dir, (err, files) => {
    if (err) return complete(err);

    let pending = files.length;
    if (!pending) return complete(null, results);

    files.forEach(file => {
      const filePath = path.resolve(dir, file);
      fs.stat(filePath, (err, stat) => {
        if (stat && stat.isFile()) {
          totalFilesScanned++;
          if (path.extname(filePath) !== ".map") {
            results.push(filePath);
          }
          if (!--pending) complete(null, results);
        } else if (stat && stat.isDirectory()) {
          walk(filePath, (err, res) => {
            results = results.concat(res);
            if (!--pending) complete(null, results);
          });
        }
      });
    });
  });
};

// returns file with 'TODO'
const searchFile = value => {
  return new Promise((resolve, reject) => {
    let matchFound = false;
    let data = "";
    const readStream = fs.createReadStream(value, { encoding: "utf8" });
    readStream.setEncoding("utf8");
    readStream.on("data", function(chunk) {
      data += chunk;
      matchFound = data.indexOf("TODO") !== -1;
      if (matchFound) {
        totalFilesMatched++;
        readStream.destroy();
      } else {
        data = "";
      }
    });
    readStream.on("error", function(err) {
      console.log(err);
    });
    readStream.on("close", () => {
      resolve(data);
    });
  });
};

// returns list of 'TODO'
const processFiles = files => {
  let currentQueueNum = 0;
  let currentFileIndex = 0;
  const results = [];

  return new Promise((resolve, reject) => {
    const handleSearchResults = currentFileIndex => values => {
      if (values) {
        results.push({
          path: files[currentFileIndex],
          todos: values.split("\n").filter(content => content.includes("TODO"))
        });
      }
      currentQueueNum--;
      printProgress(currentFileIndex);
      getBatchedFiles();
    };

    const getBatchedFiles = () => {
      if (currentQueueNum < MAX_LOAD && currentFileIndex < files.length) {
        searchFile(files[currentFileIndex])
          .then(handleSearchResults(currentFileIndex))
          .catch(err => console.log(err));
        currentFileIndex++;
        currentQueueNum++;
        getBatchedFiles();
      } else if (currentFileIndex === files.length && currentQueueNum === 0) {
        resolve(results);
      }
    };
    getBatchedFiles();
  });
};

walk(startingFolder, function(err, files) {
  if (err) throw err;
  totalFiles = files.length;
  processFiles(files)
    .then(data => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      data.map(file => {
        console.log("\x1b[33m%s\x1b[0m", file.path);
        file.todos.forEach(todo => console.log("\t", "\x1b[0m", todo.trim()));
      });
      if (performance) {
        hrend = process.hrtime(hrstart);
        console.log(`Time: ${hrend}`);
        console.log(`Files found: ${totalFilesScanned}`);
        console.log(`Files matched: ${totalFilesMatched}`);
      }
    })
    .catch(err => console.log(err));
});
