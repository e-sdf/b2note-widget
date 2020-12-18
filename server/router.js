const express = require("express");

const router = express.Router();

// Get the widget info version
router.get("/widget", (req, resp) => {
  resp.render("widgetInfo");
});

// Return widget; from historical reasons, loading a widget with a Target is POST
router.post("/widget", (req, resp) => {
  const pid = req.body.pid_tofeed;
  const pidName = req.body.pidName_tofeed;
  const source = req.body.subject_tofeed;
  const sourceName = req.body.subjectName_tofeed;
  const target = req.body.target_tofeed;
  resp.render("widget", { pid, pidName, source, sourceName, target });
});

module.exports = router;
