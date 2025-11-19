const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getMyProfile,
  getMyPosts,
  updateProfile,
  followUser,
  unfollowUser,
  getUserProfile,
  getNotifications,
  markNotificationRead
} = require("../controllers/userController");

// MY PROFILE
router.get("/me", auth, getMyProfile);
router.get("/my-posts", auth, getMyPosts);
router.patch("/me", auth, updateProfile);

// FOLLOW / UNFOLLOW
router.post("/follow/:id", auth, followUser);
router.post("/unfollow/:id", auth, unfollowUser);

// NOTIFICATIONS
router.get("/notifications", auth, getNotifications);
router.post("/notifications/:id/read", auth, markNotificationRead);

// VIEW OTHER USER PROFILE
router.get("/:id", auth, getUserProfile);

module.exports = router;
