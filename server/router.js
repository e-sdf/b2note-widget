const express = require("express");
const responses = require("./responses");

const router = express.Router();

// Get the widget info version
router.get("/", (req, resp) => {
  resp.render("widgetInfo");
});

// Old redirect
router.post("/interface_main.html", (req, resp) => {
  resp.redirect(307, "/widget");
});

// Return widget; from historical reasons, loading a widget with a Target is POST
router.post("/", (req, resp) => {
  if (!req.body.pid_tofeed) {
    responses.clientErr(resp, { error: "pid_tofeed missing in body" });
  } else {
    const pid = req.body.pid_tofeed;
    if (!req.body.subject_tofeed)  {
      responses.clientErr(resp, { error: "subject_tofeed missing in the body" });
    } else {
      const source = req.body.subject_tofeed;
      resp.render("widget", { pid, source });
    }
  }
});

module.exports = router;
