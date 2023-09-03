const mongoose = require("mongoose");

const skinSchema = new mongoose.Schema({
    sticker_name: String,
    sticker_amount: Number,
    best_sticker_position: Number,
    item_name: String,
    item_img: String,
    market_price: String,
    seller_price: String,
    sticker_price: Number,
    sticker_seller_price: Number,
    sticker_percentage_price: Number
})

module.exports = mongoose.model("Skin", skinSchema);