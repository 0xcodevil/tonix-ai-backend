const jwt = require('jsonwebtoken');

module.exports.generate = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};

module.exports.verify = (token) => {
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return { success: true, payload };
    } catch (error) {
        return { success: false, error };
    }
};