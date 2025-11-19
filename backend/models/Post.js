const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Normal post fields
    description: { type: String, required: true },
    location: { type: String },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],

    isRidePost: { type: Boolean, default: false },

    title: { type: String, default: "" },

    rideDate: { type: String, default: "" },   // ex: "2025-11-20"
    rideTime: { type: String, default: "" },   // ex: "06:30 AM"

    startPoint: { type: String, default: "" },
    endPoint: { type: String, default: "" },

    // users who clicked "Interested!"
    interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true   // createdAt + updatedAt
  }
);

module.exports = mongoose.model("Post", PostSchema);
