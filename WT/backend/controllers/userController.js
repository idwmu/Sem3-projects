const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// GET logged-in user's profile (with basic info)
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Get Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET my posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log("Get My Posts Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// UPDATE bio/username (multipart for profilePic)
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.bio) updates.bio = req.body.bio;
    if (req.file) updates.profilePic = req.file.filename;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json({ msg: "Profile updated", user });
  } catch (err) {
    console.log("Update Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// FOLLOW a user
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ msg: "Can't follow yourself" });
    }

    const me = await User.findById(req.user._id);
    const target = await User.findById(targetId);

    if (!target) return res.status(404).json({ msg: "User not found" });

    if (me.following.includes(targetId)) {
      return res.status(400).json({ msg: "Already following" });
    }

    me.following.push(targetId);
    target.followers.push(me._id);

    await me.save();
    await target.save();

    // create notification (no duplicate import)
    await Notification.create({
      user: target._id,
      from: me._id,
      type: "follow",
    });

    res.json({ msg: "Followed" });

  } catch (err) {
    console.log("Follow Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


// UNFOLLOW a user
exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) return res.status(400).json({ msg: "Can't unfollow yourself" });

    const me = await User.findById(req.user._id);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ msg: "User not found" });

    me.following = me.following.filter((id) => id.toString() !== targetId);
    target.followers = target.followers.filter((id) => id.toString() !== me._id.toString());
    await me.save();
    await target.save();

    res.json({ msg: "Unfollowed" });
  } catch (err) {
    console.log("Unfollow Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user._id }).populate("from", "username").sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.log("Get Notifications Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const id = req.params.id;
    const n = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json({ msg: "Marked read", notification: n });
  } catch (err) {
    console.log("Mark Read Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get another user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log("Get User Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};