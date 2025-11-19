const Post = require("../models/Post");
const Notification = require("../models/Notification");

// CREATE POST (normal or community ride post)
exports.createPost = async (req, res) => {
  try {
    const {
      description,
      location,

      // Ride post fields
      isRidePost,
      title,
      rideDate,
      rideTime,
      startPoint,
      endPoint
    } = req.body;

    const post = await Post.create({
      user: req.user._id,
      description,
      location,
      image: req.file ? req.file.filename : null,

      // community ride props
      isRidePost: isRidePost === "true",
      title,
      rideDate,
      rideTime,
      startPoint,
      endPoint,
      interestedUsers: []
    });

    res.json(post);
  } catch (err) {
    console.log("Create Post Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// LIKE POST
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user._id.toString();

    if (post.likes.includes(userId)) {
      return res.status(400).json({ msg: "Already liked" });
    }

    post.likes.push(userId);
    await post.save();

    // notify owner
    if (post.user.toString() !== userId) {
      await Notification.create({
        type: "like",
        user: post.user,
        from: userId,
        post: post._id
      });
    }

    res.json({ msg: "Post liked", likes: post.likes.length });
  } catch (err) {
    console.log("Like Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// UNLIKE POST
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user._id.toString();

    post.likes = post.likes.filter((id) => id.toString() !== userId);
    await post.save();

    res.json({ msg: "Post unliked", likes: post.likes.length });
  } catch (err) {
    console.log("Unlike Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user._id;

    const newComment = {
      user: userId,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // notify owner
    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        type: "comment",
        user: post.user,
        from: userId,
        post: post._id,
        text
      });
    }

    res.json({ msg: "Comment added", comments: post.comments });
  } catch (err) {
    console.log("Add Comment Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET COMMENTS
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "comments.user",
      "username"
    );

    if (!post) return res.status(404).json({ msg: "Post not found" });

    res.json(post.comments);
  } catch (err) {
    console.log("Get Comments Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("interestedUsers", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log("GetAllPosts Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// DELETE POST (owner only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    await post.deleteOne();
    res.json({ msg: "Post deleted" });
  } catch (err) {
    console.log("Delete Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// MARK INTERESTED FOR RIDE POST
exports.markInterested = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isRidePost)
      return res.status(400).json({ msg: "Not a ride post" });

    const userId = req.user._id.toString();

    if (post.interestedUsers.includes(userId))
      return res.status(400).json({ msg: "Already joined" });

    post.interestedUsers.push(userId);
    await post.save();

    // notify ride creator
    if (post.user.toString() !== userId) {
      await Notification.create({
        type: "ride_interest",
        user: post.user, // owner
        from: userId,
        post: post._id
      });
    }

    res.json({ msg: "Marked as interested", interested: post.interestedUsers });
  } catch (err) {
    console.log("Ride Interest Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
