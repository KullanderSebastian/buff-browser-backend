const User = require("../models/user.model");
const Skin = require("../models/skin.model");
const mongoose = require("mongoose");

exports.getUser = async (req, res) => {
    try {
        googleId = req.body.gId;
        const user = await User.findOne({googleId});

        res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}

exports.addPhone = async (req, res) => {
    try {
        const googleId = req.body.gId;

        const user = await User.findOne({googleId});
        
        user.phone = req.body.phone;

        await user.save();

        res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}

exports.addItemToWatchlist = async (req, res) => {
    try {
        const googleId = req.body.gId;
        const { itemName, wear, stickerName } = req.body;

        const user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const existingItemInOtherDB = await Skin.findOne({
            sticker_name: stickerName,
            item_name: `${itemName} (${wear})`
        });

        const itemExistsInWatchlist = user.watchlist.some(
            (item) => 
                item.itemName === itemName &&
                item.wear === wear &&
                item.stickerName === stickerName
        );

        if (!existingItemInOtherDB && !itemExistsInWatchlist) {
            user.watchlist.push({ itemName, wear, stickerName });
            await user.save();
            res.status(200).send(user);
        } else {
            res.status(409).send("Item already exists in the database or watchlist");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}

exports.getItemsFromWatchlist = async (req, res) => {
    try {
        const googleId = req.params.gId;

        const user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const watchlist = user.watchlist;

        res.status(200).send(watchlist);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}