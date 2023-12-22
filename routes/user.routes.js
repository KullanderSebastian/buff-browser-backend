const express = require('express');
const userController = require("../controllers/user.controller.js");
const { authenticateToken } = require("../jwtGenerator.js");

const userRouter = express.Router();

userRouter.post("/getuser", authenticateToken, userController.getUser);

userRouter.post("/addphone", userController.addPhone);

userRouter.post("/additemtowatchlist", userController.addItemToWatchlist);

userRouter.get("/watchlist/:gId", userController.getItemsFromWatchlist);

module.exports = userRouter;