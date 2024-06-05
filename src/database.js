const mongoose = require("mongoose");
const configObject = require("./config/env.config.js");
const { mongo_url } = configObject;
const { logger } = require("./config/logger.config.js");

mongoose
  .connect(mongo_url)
  .then(() => logger.info("Conectados a la Base de datos"))
  .catch((error) =>
    logger.fatal("Error de conexion con la base de datos", error)
  );
