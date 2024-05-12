const User = require("../models/user.model");
const Skin = require("../models/skin.model");
const mongoose = require("mongoose");
//const CryptoJS = require('crypto-js');

const createHash = require('./helper/createHash');

exports.getUser = async (req, res) => {
    try {
        googleId = req.cookies.gId;
        const user = await User.findOne({googleId});

        res.status(200).send(user);
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}

exports.updatePhone = async (req, res) => {
    try {
        const phone = req.body.phone;
        const gId = req.cookies.gId;

        const user = await User.findOneAndUpdate(
            { googleId: gId },
            { $set: { phone: phone}},
            { new: true }
        );

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).send({ phone: user.phone });
    } catch (error) {
        console.error("Update phone error: ", error.message);
        res.status(500).send("Internal Server Error: ", error);
    }
};

exports.updateNotificationPreference = async (req, res) => {
    try {
        const notificationPreference = req.body.notificationPreference;
        const gId = req.cookies.gId;

        const user = await User.findOneAndUpdate(
            { googleId: gId },
            { $set: { notificationPreference: notificationPreference}},
            { new: true }
        );

        if (!user) {
            return res.status(404).send("User not found");
        }

        res.status(200).send({ notificationPreference: user.notificationPreference });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error: ", error);
    }
}

exports.addItemToWatchlist = async (req, res) => {
    try {
        const googleId = req.cookies.gId;
        const { itemName, wear, stickerName } = req.body;

        const user = await User.findOne({ googleId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters for RegExp
        }

        console.log('Wear:', wear);

        const itemFullName = `${itemName} | (${wear})`;
        console.log('Item Full Name:', itemFullName); // Log the concatenated item name


        const itemNameRegex = new RegExp(`^${escapeRegExp(itemName + ' (' + wear + ')')}$`, "i");

        const stickerNameRegex = new RegExp(`^${escapeRegExp(stickerName)}$`, "i");

        console.log(itemNameRegex);
        console.log(stickerNameRegex);

        const existingItemInOtherDB = await Skin.find({ 
            item_name: itemNameRegex,
            sticker_name: stickerNameRegex
        });

        console.log(existingItemInOtherDB);

        const itemExistsInWatchlist = user.watchlist.some(
            (item) => 
                item.itemName.toLowerCase() === itemName.toLowerCase() &&
                item.wear.toLowerCase() === wear.toLowerCase() &&
                item.stickerName.toLowerCase() === stickerName.toLowerCase()
        );

        const skinHashString = createHash({
            item_name: `${itemName} (${wear})`,
            sticker_name: stickerName
        });

        if (existingItemInOtherDB.length === 0 && !itemExistsInWatchlist) {
            user.watchlist.push({ 
                itemName, 
                wear, 
                stickerName,
                hash: skinHashString
            });
            await user.save();
            res.status(200).send(user);
        } else {
            res.status(409).send({ error: "Item already exists in the database or watchlist" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}

exports.removeItemFromWatchlist = async (req, res) => {
    try {
        const googleId = req.cookies.gId;
        const objectId = req.body.objectId;

        const result = await User.updateOne(
            { googleId: googleId },
            { $pull: { watchlist: { _id: objectId } } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ success: true, message: "Item removed from the watchlist." });
        } else {
            res.status(404).json({ success: false, message: "No matching document found." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}