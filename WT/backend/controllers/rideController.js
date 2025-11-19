const Ride = require("../models/Ride");

exports.createRide = async (req, res) => {
  try {
    const ride = await Ride.create({
      user: req.user._id,
      ...req.body
    });
    res.json(ride);
  } catch (err) {
    console.log("Create Ride Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (err) {
    console.log("Ride Fetch Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.markInterest = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ msg: "Ride not found" });

    const userId = req.user._id.toString();

    if (!ride.interested.includes(userId)) {
      ride.interested.push(userId);
      await ride.save();
    }

    res.json({ msg: "Marked interest" });
  } catch (err) {
    console.log("Interest Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
