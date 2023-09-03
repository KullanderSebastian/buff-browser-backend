const Skin = require("../models/skin.model");
const mongoose = require("mongoose");

exports.getSkins = async (req, res) => {
    try {
        let query = {};
        const MAX_LIMIT = 100;

        if (req.body.sticker_name) {
            query.sticker_name = new RegExp(req.body.sticker_name, "i");
        }

        if (req.body.item_name) {
            query.item_name = new RegExp(req.body.item_name, "i");
        }

        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        limit = Math.min(limit, MAX_LIMIT);
        let offset = (page - 1) * limit;

        const totalItems = await Skin.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const skins = await Skin.find(query).skip(offset).limit(limit).exec()

        res.json({
            data: skins,
            meta: {
                totalItems: totalItems,
                itemsPerPage: limit,
                totalPages: totalPages,
                currentPage: page
            }
        });

    } catch(error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

exports.deleteAllSkins = async (req, res) => {
        try {
            // List all collections
            const collections = Object.keys(mongoose.connection.collections);
            
            for (const collectionName of collections) {
                const collection = mongoose.connection.collections[collectionName];
                await collection.drop(); // Drop each collection
            }
    
            console.log("All collections have been deleted.");
            mongoose.disconnect();
        } catch (error) {
            console.error("Error deleting collections:", error);
            mongoose.disconnect();
        }
}