const express = require('express');
const skinController = require("../controllers/skin.controller.js");

const skinRouter = express.Router();

skinRouter.post("/getskins", skinController.getSkins);

module.exports = skinRouter;