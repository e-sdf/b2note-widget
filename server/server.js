const http = require("http");
const config = require("./config");
const app = require("./app");

// Server initialisation

console.log(config);

function onListening() {
  const addr = config.serverBinding;
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + (addr ? addr.port : "");
  console.log("B2NOTE widget server listening on " + bind);
}

const server = http.createServer(app);
const port = config.port;
app.set("port", port);
server.on("listening", onListening);
server.listen(port);
