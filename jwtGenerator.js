const jwt = require('jsonwebtoken');

const generateJWT = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

module.exports = generateJWT;