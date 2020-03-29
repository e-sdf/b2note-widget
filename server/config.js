const logging = require("./logging");

const config = {
  port: process.env.PORT || "",
};

// Check if all env variables were present
const configValues = Object.values(config);
const nonEmpty = configValues.filter(v => v || v.length > 0);
if (configValues.length !== nonEmpty.length) {
  logging.logError("Missing some env variable(s):");
  logging.logError(JSON.stringify(config, null, 2));
  process.exit(1);
}

module.exports = config;
