const fs = require("fs");
const path = require("path");
const MAX_LOAD = 200;

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
        readStream.destroy();
      } else {
        data = "";
      }
    });
    readStream.on("error", function(err) {
      reject(err);
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
    const handleSearchResults = (fileContent, filePath) => {
      if (fileContent) {
        results.push(filePath);
      }
      currentQueueNum--;
      getBatchedFiles();
    };

    const getBatchedFiles = () => {
      if (currentQueueNum < MAX_LOAD && currentFileIndex < files.length) {
        searchFile(files[currentFileIndex])
          .then(result=>handleSearchResults(result, files[currentFileIndex]))
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

const folder = process.argv[2];

walk(folder, function(err, files) {
  if (err) throw err;
  totalFiles = files.length;
  processFiles(files)
    .then(val => {
      val.map(value => {
        console.log(value);
      });
    })
    .catch(err => console.log(err));
});
