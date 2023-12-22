const jwt = require('jsonwebtoken');

const generateJWT = (user) => {
    return jwt.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization").split(" ")[1];

    //console.log('Decoded token payload:', jwt.decode(token));

    //console.log('Authorization header:', token);

    if (!token) return res.status(401).send("Access denied. No Token provided.");

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).send("Invalid token.");

        console.log(decoded)

        req.user = decoded;
        next();
    });
};

module.exports = {
    generateJWT,
    authenticateToken,
};