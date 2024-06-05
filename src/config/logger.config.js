const winston = require("winston");
const config = require("./env.config.js");

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    http: 4,
    info: 3,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "yellow",
    warning: "blue",
    info: "green",
    http: "magenta",
    debug: "white",
  },
};

const devLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "./errors.log",
      level: "debug",
      format: winston.format.simple(),
    }),
  ],
});

const prodLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "./errors.log", level: "warning" }),
  ],
});

const logger = config.environment === "produccion" ? prodLogger : devLogger;

const addLogger = (req, res, next) => {
  if (config.environment === "produccion") {
    req.logger = prodLogger;
    req.logger.info(
      `${req.method} en ${
        req.url
      } - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
    );
  } else {
    req.logger = devLogger;
  }
  next();
};

module.exports = { logger, addLogger };
