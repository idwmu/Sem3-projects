const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const {
  createPost,
  getAllPosts,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deletePost
} = require("../controllers/postController");

// Create post
router.post("/", auth, upload.single("image"), createPost);

// Get all posts
router.get("/", auth, getAllPosts);

// Likes
router.put("/like/:id", auth, likePost);
router.put("/unlike/:id", auth, unlikePost);

// Comments
router.post("/comment/:id", auth, addComment);
router.get("/comment/:id", auth, getComments);

// Delete post (ONLY THIS — remove the duplicate)
router.delete("/:id", auth, deletePost);

module.exports = router;
