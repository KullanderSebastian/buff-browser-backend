const CryptoJS = require('crypto-js');

function createHash(data) {
    let jsonString = JSON.stringify(data);

    jsonString = jsonString.replace(/":"/g, '": "');
    jsonString = jsonString.replace(/,"/g, ', "');
    
    const skinHash = CryptoJS.SHA256(jsonString);
    return skinHash.toString(CryptoJS.enc.Hex);
}

module.exports = createHash;