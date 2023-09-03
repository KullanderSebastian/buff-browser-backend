const express = require('express');
const skinController = require("../controllers/skin.controller.js");

const skinRouter = express.Router();

skinRouter.post("/getskins", skinController.getSkins);

skinRouter.post("/deleteskins", skinController.deleteAllSkins);

module.exports = skinRouter;