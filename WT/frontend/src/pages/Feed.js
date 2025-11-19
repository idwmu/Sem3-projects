import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const postRes = await API.get("/posts");
      const rideRes = await API.get("/rides");

      const combined = [
        ...postRes.data.map((p) => ({ ...p, kind: "post" })),
        ...rideRes.data.map((r) => ({ ...r, kind: "ride" }))
      ];

      combined.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPosts(combined);
    } catch (err) {
      console.log("Error fetching feed", err);
    }
  };

  const interestRide = async (rideId) => {
    try {
      const res = await API.post(`/rides/interest/${rideId}`);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === rideId
            ? { ...p, interested: [...(p.interested || []), "me"] }
            : p
        )
      );
    } catch (err) {
      console.log("Interest error", err);
    }
  };

  const openComments = async (postId) => {
    setShowComments(true);
    setActivePostId(postId);

    try {
      const res = await API.get(`/posts/comment/${postId}`);
      setComments(res.data);
    } catch (err) {
      console.log("Error loading comments");
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;

    await API.post(`/posts/comment/${activePostId}`, { text: commentText });

    const res = await API.get(`/posts/comment/${activePostId}`);
    setComments(res.data);
    setCommentText("");
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={styles.page}>
      
      {/* LEFT SIDEBAR */}
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>RideUp</h1>

        <button style={styles.sideButton} onClick={() => navigate("/feed")}>
          🏠 Feed
        </button>

        <button style={styles.sideButton} onClick={() => navigate("/profile")}>
          👤 Profile
        </button>

        <button style={styles.sideButton} onClick={() => navigate("/create-post")}>
          ➕ New Post
        </button>

        <button style={styles.sideButton} onClick={() => navigate("/create-ride")}>
          🚴‍♂️ Find Riders
        </button>

        <button
          style={{ ...styles.sideButton, marginTop: "auto", background: "#900" }}
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* CENTER FEED */}
      <div style={styles.feedColumn}>

        {posts.map((p) => (
          <div
            key={p._id}
            style={{
              ...styles.card,
              border:
                p.kind === "ride" ? "2px solid #1DA1F2" : "1px solid #333"
            }}
          >
            {/* HEADER */}
            <div style={styles.headerRow}>
              <h4 style={{ margin: 0 }}>{p.user?.username}</h4>

              {p.kind === "post" && (
                <button
                  style={styles.likeButton}
                  onClick={async () => {
                    try {
                      const res = await API.put(`/posts/like/${p._id}`);
                      setPosts((prev) =>
                        prev.map((x) =>
                          x._id === p._id
                            ? { ...x, likes: res.data.likes }
                            : x
                        )
                      );
                    } catch (err) {
                      console.log("Like error", err);
                    }
                  }}
                >
                  ❤️ {p.likes ? p.likes.length : 0}
                </button>
              )}
            </div>

            {/* CONTENT */}
            {p.kind === "ride" ? (
              <>
                <div style={styles.rideTag}>🏍 Ride Event</div>

                <h3 style={{ marginTop: 5 }}>{p.title}</h3>

                <p>
                  <b>Date:</b> {p.date}
                </p>
                <p>
                  <b>Time:</b> {p.time}
                </p>

                <p>
                  <b>Route:</b> {p.startLocation} → {p.destination}
                </p>

                <p style={{ marginTop: 10 }}>{p.description}</p>

                <button
                  style={styles.interestButton}
                  onClick={() => interestRide(p._id)}
                >
                  ✔ Interested ({p.interested?.length || 0})
                </button>
              </>
            ) : (
              <>
                <p>{p.description}</p>

                {p.image && (
                  <div style={styles.imageWrapper}>
                    <img
                      src={`http://localhost:8000/uploads/${p.image}`}
                      style={styles.image}
                    />
                  </div>
                )}

                {p.location && (
                  <p style={styles.location}>📍 {p.location}</p>
                )}
              </>
            )}

            {/* COMMENTS BUTTON */}
            {p.kind === "post" && (
              <button
                style={styles.commentBtn}
                onClick={() => openComments(p._id)}
              >
                💬 View Comments
              </button>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT COMMENTS PANEL */}
      {showComments && (
        <div style={styles.commentPanel}>
          <button
            style={styles.closeBtn}
            onClick={() => setShowComments(false)}
          >
            ✖
          </button>

          <h3>Comments</h3>

          <div style={styles.commentList}>
            {comments.map((c) => (
              <div key={c._id} style={styles.commentItem}>
                <b>{c.user?.username}</b> {c.text}
              </div>
            ))}
          </div>

          <div style={styles.commentBox}>
            <input
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <button style={styles.sendBtn} onClick={addComment}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== STYLES ===================
const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#111",
    color: "#eee"
  },

  sidebar: {
    width: "220px",
    padding: "20px",
    background: "#000",
    borderRight: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  sideButton: {
    padding: "10px",
    background: "#222",
    borderRadius: "6px",
    color: "#eee",
    textAlign: "left",
    cursor: "pointer",
    border: "none"
  },

  logo: { marginBottom: "20px" },

  feedColumn: {
    flex: 1,
    padding: "20px",
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  card: {
    width: "500px",
    background: "#181818",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "25px"
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  likeButton: {
    background: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px"
  },

  rideTag: {
    background: "#1DA1F2",
    color: "#000",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-block",
    marginTop: 5,
    marginBottom: 5,
    fontWeight: "bold"
  },

  interestButton: {
    marginTop: 10,
    padding: "8px",
    width: "100%",
    background: "#1DA1F2",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
    fontWeight: "bold",
    color: "#000"
  },

  imageWrapper: {
    width: "100%",
    height: "500px",
    borderRadius: "12px",
    background: "#000",
    overflow: "hidden",
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  image: {
    width: "100%",
    maxHeight: "500px",
    objectFit: "contain"
  },

  location: {
    marginTop: "10px",
    fontStyle: "italic",
    color: "#aaa"
  },

  commentBtn: {
    marginTop: "10px",
    padding: "8px",
    width: "100%",
    background: "#222",
    borderRadius: "6px",
    color: "#ddd",
    cursor: "pointer",
    border: "1px solid #444"
  },

  commentPanel: {
    width: "350px",
    background: "#000",
    borderLeft: "1px solid #333",
    padding: "20px",
    display: "flex",
    flexDirection: "column"
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#f55",
    alignSelf: "flex-end",
    cursor: "pointer"
  },

  commentList: {
    flex: 1,
    overflowY: "scroll",
    marginTop: "10px"
  },

  commentItem: {
    borderBottom: "1px solid #222",
    padding: "8px 0"
  },

  commentBox: {
    display: "flex",
    gap: "8px",
    marginTop: "10px"
  },

  commentInput: {
    flex: 1,
    background: "#222",
    color: "#fff",
    borderRadius: "6px",
    padding: "8px",
    border: "1px solid #444"
  },

  sendBtn: {
    background: "#1e90ff",
    borderRadius: "6px",
    padding: "8px 12px",
    border: "none",
    color: "#fff",
    cursor: "pointer"
  }
};

export default Feed;
