const { logger } = require("../config/logger.config.js");

class LoggerController {
  generateLogs = (req, res) => {
    try {
      logger.fatal("Uy no este error si que es peligrosooo!!!");
      logger.error("Revisa de nuevo ya que es grave");
      logger.warning("Brother checale bien!!");
      logger.info("Esto solo es un aviso informativo");
      logger.http("Papito solo es un HTTP");
      logger.debug("Solo es un debug");
      res.send("Se han generado todos los logs");
    } catch (error) {
      logger.error("Error al generar logs:", error);
      res.status(500).send("Error al generar logs");
    }
  };
}

module.exports = LoggerController;
