const express = require("express");
const router = express.Router();
const MockController = require("../controllers/mock.controller.js");
const mockController = new MockController();
const LoggerController = require("../controllers/logger.controller.js");
const loggerController = new LoggerController();

router.get("/mockingproducts", mockController.getProducts);
router.get("/loggerTest", loggerController.generateLogs);

module.exports = router;
