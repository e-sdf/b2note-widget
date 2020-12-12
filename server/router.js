const express = require("express");
const responses = require("./responses");

const router = express.Router();

// Get the widget info version
router.get("/widget", (req, resp) => {
  const pid = req.query.pid_tofeed;
  const pidName = req.query.pidName_tofeed;
  const source = req.query.subject_tofeed;
  const sourceName = req.query.subjectName_tofeed;
  const xPath = req.query.xPath_tofeed;
  const textContent = req.query.textContent_tofeed;
  const startOffset = req.query.startOffset_tofeed;
  const endOffset = req.query.endOffset_tofeed;
  const svgSelector = req.query.svgSelector_tofeed;
  resp.render("widget", { pid, pidName, source, sourceName, xPath, textContent, startOffset, endOffset, svgSelector });
  // resp.render("widgetInfo");
});

// Return widget; from historical reasons, loading a widget with a Target is POST
router.post("/widget", (req, resp) => {
  const pid = req.body.pid_tofeed;
  const pidName = req.body.pidName_tofeed;
  const source = req.body.subject_tofeed;
  const sourceName = req.body.subjectName_tofeed;
  const xPath = req.body.xPath_tofeed;
  const textContent = req.body.textContent_tofeed;
  const startOffset = req.body.startOffset_tofeed;
  const endOffset = req.body.endOffset_tofeed;
  const svgSelector = req.body.svgSelector_tofeed;
  resp.render("widget", { pid, pidName, source, sourceName, xPath, textContent, startOffset, endOffset, svgSelector });
});

module.exports = router;
