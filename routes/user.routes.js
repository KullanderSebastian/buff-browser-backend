const express = require('express');
const userController = require("../controllers/user.controller.js");
const { authenticateToken } = require("../jwtGenerator.js");

const userRouter = express.Router();

userRouter.post("/getuser", authenticateToken, userController.getUser);

userRouter.post("/updatephone", authenticateToken, userController.updatePhone);

userRouter.post("/additemtowatchlist", authenticateToken, userController.addItemToWatchlist);

userRouter.post("/removeitemfromwatchlist", authenticateToken, userController.removeItemFromWatchlist);

userRouter.post("/updatenotificationpreference", authenticateToken, userController.updateNotificationPreference);

module.exports = userRouter;