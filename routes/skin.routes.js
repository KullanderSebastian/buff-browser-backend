const express = require('express');
const skinController = require("../controllers/skin.controller.js");

const skinRouter = express.Router();

skinRouter.post("/test", (req, res)=>{res.send("hererer"); 	});
skinRouter.post("/getskins", skinController.getSkins);

module.exports = skinRouter;
