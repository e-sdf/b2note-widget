const express = require("express");
const responses = require("./responses");

const router = express.Router();

// Get the widget info version
router.get("/widget", (req, resp) => {
  resp.render("widgetInfo");
});

// Return widget; from historical reasons, loading a widget with a Target is POST
router.post("/widget", (req, resp) => {
  const pid = req.body.pid_tofeed;
  if (!pid) {
    responses.clientErr(resp, { error: "pid_tofeed missing in body" });
  } else {
    const source = req.body.subject_tofeed;
    const xPath = req.body.xpath_tofeed;
    const textContent = req.body.textContent_tofeed;
    const startOffset = req.body.startOffset_tofeed;
    const endOffset = req.body.endOffset_tofeed;
    resp.render("widget", { pid, source, xPath, textContent, startOffset, endOffset });
  }
});

module.exports = router;
