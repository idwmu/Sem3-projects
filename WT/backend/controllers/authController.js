const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        console.log("REGISTER BODY:", req.body);   // <--- ADD THIS

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            console.log("Missing field");
            return res.status(400).json({ msg: "Missing fields" });
        }

        const userExists = await User.findOne({ email });
        console.log("USER EXISTS:", userExists);   // <--- ADD THIS

        if (userExists) return res.status(400).json({ msg: "Email already used" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        console.log("USER CREATED:", user);  // <--- ADD THIS

        res.json({ msg: "User registered", user });
    } catch (err) {
        console.log("REGISTER ERROR:", err);  // <--- ADD THIS
        res.status(500).json({ msg: "Server error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ msg: "Incorrect password" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ msg: "Login successful", token });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
