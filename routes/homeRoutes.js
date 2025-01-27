const express = require("express");
const homeRouter = express.Router();
const homeController = require("../controllers/homeController");

homeRouter.get("/", homeController.showHomePage);

module.exports = homeRouter;
