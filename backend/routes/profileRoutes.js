const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const {
  getMyProfile,
  updateBio,
  updateProfilePic,
  getUserProfile
} = require("../controllers/profileController");

// My profile
router.get("/me", auth, getMyProfile);

// Update bio
router.put("/bio", auth, updateBio);

// Update profile picture
router.put("/profile-pic", auth, upload.single("image"), updateProfilePic);

// Get another user's profile
router.get("/:id", getUserProfile);

module.exports = router;
