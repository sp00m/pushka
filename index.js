const { promisify } = require("util");

const fs = require("fs");
const mkdirp = promisify(require("mkdirp"));
const ncp = promisify(require("ncp"));
const pug = require("pug");
const rimraf = promisify(require("rimraf"));

const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const compile = (inputFile) => {
  const html = pug.renderFile(inputFile);
  const outputFile = inputFile
    .replace("./pug/", "./dist/")
    .replace(/\.pug$/, ".html");
  const outputDir = outputFile
    .replace(/[^/]+$/, "");
  return mkdirp(outputDir)
    .then(() => writeFile(outputFile, html));
};

const walk = (dir) => readDir(dir)
  .then((files) => Promise.all(files
    .filter((file) => !file.startsWith("_"))
    .filter((file) => (/^[^.]+$|\.pug$/).test(file))
    .map((file) => `${dir}/${file}`)
    .map((file) => file.endsWith(".pug") ? compile(file) : walk(file))
  ));

rimraf("./dist")
  .then(() => mkdirp("./dist"))
  .then(() => ncp("./static", "./dist"))
  .then(() => walk("./pug"))
  .then(() => console.log("Built!"))
  .catch((error) => console.error(error));
