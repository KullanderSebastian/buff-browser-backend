const Skin = require("../models/skin.model");
const mongoose = require("mongoose");

exports.getUser = async (req, res) => {
    try {

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error: ", error);
    }
}