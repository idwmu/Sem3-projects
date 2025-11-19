const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createRide, getAllRides, markInterest } = require("../controllers/rideController");

router.post("/", auth, createRide);
router.get("/", auth, getAllRides);
router.post("/interest/:id", auth, markInterest);

module.exports = router;
