const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const logging = require("./logging");
const router = require("./router");

console.log("Starting B2NOTE widget webserver at " + __dirname);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

if (process.env.NODE_ENV == "production") {
  app.use(logger("common"));
} else {
  app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.options("*", cors());

// Register error handler
app.use((err, req, resp, next) => {
  logging.logError(err);
  resp.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.set("view engine", "ejs");

app.use("/favicon.ico", express.static("favicon.ico"));

app.use("/", router);

module.exports = app;
