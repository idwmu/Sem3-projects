const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ msg: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // FIX: store user as an actual object
        req.user = { _id: decoded.id };

        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
    }
};
