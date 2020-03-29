const chalk = require("chalk");

function logError(msg) {
  console.error(new Error(chalk.bold.red(msg)));
}

module.exports = { logError };
