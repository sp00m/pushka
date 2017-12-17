const { promisify } = require("util");

const fs = require("fs");
const mkdirp = promisify(require("mkdirp"));
const ncp = promisify(require("ncp"));
const pug = require("pug");
const rimraf = promisify(require("rimraf"));

const readDir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

const noop = () => {};
const src = "./src";
const dist = "./dist";

const clean = () => rimraf(dist);

const init = () => mkdirp(dist).then(noop);

const render = (inputFile) => {
  const html = pug.renderFile(inputFile);
  const outputFile = inputFile
    .replace(`${src}/`, `${dist}/`)
    .replace(/\.pug$/, ".html");
  const outputDir = outputFile
    .replace(/[^/]+$/, "");
  return mkdirp(outputDir)
    .then(() => writeFile(outputFile, html));
};

const compile = (dir = src) => readDir(dir)
  .then((files) => Promise.all(files
    .filter((file) => (/^[^.]+$|\.pug$/).test(file))
    .filter((file) => !file.startsWith("_"))
    .map((file) => `${dir}/${file}`)
    .map((file) => file.endsWith(".pug") ? render(file) : compile(file))
  ));

const filter = (path) => (/^(?!_)[^.]+$|\.(?!pug$)[^.]+$/).test(path.replace(/.*\//, ""));

const copy = () => ncp(src, dist, { filter });

const done = () => console.log("Built!");

const fail = (error) => console.error(error);

clean()
  .then(init)
  .then(compile)
  .then(copy)
  .then(done)
  .catch(fail);
