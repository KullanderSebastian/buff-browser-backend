const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    notificationPreference: { type: String, default: "Email" },
    watchlist: [
        {
            itemName: String,
            wear: String,
            stickerName: String,
            hash: String,
            status: { type: Boolean, default: false },
            found: Date,
        }
    ],
    refreshToken: { type: String, default: "" },
    refreshTokenExpires: Date,
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