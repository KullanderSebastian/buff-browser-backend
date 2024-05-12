const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const User = require('./models/user.model');

const generateJWT = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) return res.status(401).send("Access denied. No Token provided.");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send("Invalid token.");

        console.log(decoded)

        req.user = decoded;
        next();
    });
};

const generateRefreshToken = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer.toString("hex"));
            }
        });
    });
};

const authenticateRefreshToken = async (refreshToken, res) => {
    try {
        const user = await User.findOne({
            refreshToken: refreshToken,
            refreshTokenExpires: { $gte: new Date() }
        });

        if (!user) {
            return { error: "Access denied. Invalid or expired refresh token", statusCode: 403 };
        }

        const newAccessToken = generateJWT(user);
        return { accessToken: newAccessToken };
    } catch (err) {
        console.error("Error authenticating refresh token: ", err);
        return res.status(500).send("Internal server error.");
    }
}

module.exports = {
    generateJWT,
    authenticateToken,
    generateRefreshToken,
    authenticateRefreshToken,
};