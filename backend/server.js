require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const express = require("express");
const cors = require("cors");
const app = express();

// Middleware (must be at the top)
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("RideUp API is running");
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
