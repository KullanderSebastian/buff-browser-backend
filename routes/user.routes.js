const express = require('express');
const userController = require("../controllers/user.controller.js");

const userRouter = express.Router();

skinRouter.getuser("/getuser", userController.getUser);

module.exports = userRouter;