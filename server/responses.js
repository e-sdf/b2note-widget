function clientErr(resp, reason) {
  resp.status(400);
  resp.json(reason);
}

module.exports = { clientErr };