const Skin = require("../models/skin.model");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

exports.getSkins = async (req, res) => {
	console.log("im herererer");
    try {
        let query = {};
        const MAX_LIMIT = 100;
        const searchParameters = req.body.search_parameters || [];

        console.log(req.body.search_parameters);
        console.log(req.body.sticker_name);

        if (req.body.sticker_name.length > 0) {
            //query.sticker_name = new RegExp(req.body.sticker_name, "i");
            query.sticker_name = { $in: req.body.sticker_name.map(name => new RegExp("^" + name.trim().replace(/([\|\(\)\.])/g, '\\$1') + "$", "i"))  };
        }

        /*if (req.body.item_name.length > 0) {
            //query.item_name = new RegExp(req.body.item_name, "i");
            query.item_name = { $in: req.body.item_name.map(name => new RegExp(name, "i")) }
        }*/

        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 10) || 10;
        limit = Math.min(limit, MAX_LIMIT);
        let offset = (page - 1) * limit;

        const queries = searchParameters.map(searchParameter => {
            const keywords = searchParameter.split(" ");
            const keywordPatterns = keywords.map(keyword => {
                return keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
            });
            const finalPattern = `.*${keywordPatterns.join(".*")}.*`;
            return { item_name: { $regex: finalPattern, $options: "i" } };
        });

        if (queries.length > 0) {
            query.$or = queries;
        }

        const totalItems = await Skin.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);
        const skins = await Skin.find(query)
                                .skip(offset)
                                .limit(limit)
                                .sort({ sticker_percentage_price: 1 })
                                .exec()

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
        res.status(500).send("Internal Server Error: ", error);
    }
}
