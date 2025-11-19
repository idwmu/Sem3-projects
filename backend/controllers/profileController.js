const User = require("../models/User");
const Post = require("../models/Post");

// GET logged-in user's profile (basic info)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Get Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET logged-in user's posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort({ createdAt: -1 });  // newest first
    
    res.json(posts);
  } catch (err) {
    console.log("Get My Posts Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE bio only
exports.updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio },
      { new: true }
    ).select("-password");

    res.json({ msg: "Bio updated", user });
  } catch (err) {
    console.log("Update Bio Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE profile picture
exports.updateProfilePic = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ msg: "No image uploaded" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: req.file.filename },
      { new: true }
    ).select("-password");

    res.json({ msg: "Profile picture updated", user });
  } catch (err) {
    console.log("Update Profile Pic Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET another user's public profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Get User Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
