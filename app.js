const express = require("express");
const expressHbs = require("express-handlebars");
const session = require("express-session");
var useragent = require('express-useragent');
const bodyParser = require("body-parser");
const path = require("path");
require('dotenv').config()


const routes = require("./routes/routes");
const db = require("./util/database");

const app = express();


app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts/",
    defaultLayout: "main-layout",
    extname: "hbs",
  })
);
app.set("view engine", "hbs");
app.set("views", "views");


//MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(useragent.express());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));

app.use("/", routes);

app.listen(3000 || process.env.PORT);
