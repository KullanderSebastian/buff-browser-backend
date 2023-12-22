const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    watchlist: [
        {
            itemName: String,
            wear: String,
            stickerName: String,
            status: { type: Boolean, default: false },
            found: Date,
        }
    ]
});

userSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    const statusChanged = update.$set && update.$set["watchlist.$.status"] === true;

    if (statusChanged) {
        this.update({}, { $set: { "watchlist.$.found": new Date() } });
    }
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;