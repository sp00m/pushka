const basicAuth = require("express-basic-auth");
const express = require("express");

const pages = require("./data/pages");
pages.forEach((page) => {
  (page.children = page.children || []).forEach((child) => {
    child.parent = page;
  })
});

const menu = pages.filter((page) => "/" !== page.url);

const app = express()
  .set("view engine", "pug")
  .set("views", "./server/views")
  .use(basicAuth({ challenge: true, realm: "Pushka", users: { "pushka": "chibre" } }))
  .use("/static", express.static("./static/"));

pages
  .reduce((flat, page) => flat.concat(page, page.children.map((child) => Object.assign(child, { parent: page }))), [])
  .filter((page) => page.url)
  .reduce((app, page) => app.get(page.url, (req, res) => res.render(page.file, { page, menu })), app)
  .listen(3000, () => console.log("Let's go!"));
