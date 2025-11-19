import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import CommentsModal from "../components/CommentsModal";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data); // do NOT sort here
    } catch (err) {
      console.log("Error fetching posts");
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

        <button style={styles.sideButton} onClick={() => navigate("/feed")}>🏠 Feed</button>
        <button style={styles.sideButton} onClick={() => navigate("/profile")}>👤 Profile</button>
        <button style={styles.sideButton} onClick={() => navigate("/create-post")}>➕ New Post</button>

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
          <div style={styles.card} key={p._id}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <h4 style={{margin:0}}>{p.user?.username}</h4>
              <div style={{display:"flex", gap:8}}>
                <button
                  onClick={async () => {
                    try {
                      const res = await API.put(`/posts/like/${p._id}`);
                      // optimistic update: update likes count locally
                      setPosts((prev) => prev.map((x) => x._id === p._id ? { ...x, likes: res.data.likes } : x));
                    } catch (err) { console.log("Like error", err); }
                  }}
                  style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
                >
                  ❤️ {p.likes ? p.likes.length : 0}
                </button>
              </div>
            </div>

            <p>{p.description}</p>

            {p.image && (
              <div style={styles.imageWrapper}>
                <img src={`http://localhost:8000/uploads/${p.image}`} style={styles.image} />
              </div>
            )}

            <p style={styles.location}>📍 {p.location}</p>

            <button style={styles.commentBtn} onClick={() => openComments(p._id)}>💬 View Comments</button>
          </div>
        ))}

      </div>

      {/* RIGHT COMMENT PANEL */}
      {showComments && (
        <div style={styles.commentPanel}>
          <button style={styles.closeBtn} onClick={() => setShowComments(false)}>✖</button>

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
            <button style={styles.sendBtn} onClick={addComment}>Post</button>
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#111",
    color: "#eee",
  },

  sidebar: {
    width: "220px",
    padding: "20px",
    borderRight: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#000",
  },

  sideButton: {
    padding: "10px",
    background: "#222",
    border: "none",
    color: "#eee",
    cursor: "pointer",
    textAlign: "left",
    borderRadius: "6px",
  },

  logo: {
    color: "#fff",
    marginBottom: "20px",
  },

  feedColumn: {
    flex: 1,
    padding: "20px",
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  card: {
    width: "500px",
    background: "#181818",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "25px",
    border: "1px solid #333",
  },

  imageWrapper: {
    width: "100%",
    height: "500px",
    backgroundColor: "#000",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "10px",
  },

  image: {
    width: "100%",
    maxHeight: "500px",
    objectFit: "contain",   
    borderRadius: "12px",
    backgroundColor: "#000",  // keeps it clean when image doesn't fill full space
    marginTop: "10px",
    maxHeight: "70vh",
    objectFit: "contain",

  },

  location: {
    marginTop: "10px",
    fontStyle: "italic",
    color: "#aaa",
  },

  commentBtn: {
    marginTop: "10px",
    padding: "8px",
    width: "100%",
    background: "#222",
    border: "1px solid #444",
    color: "#ddd",
    borderRadius: "6px",
    cursor: "pointer",
  },

  // RIGHT COMMENTS PANEL
  commentPanel: {
    width: "350px",
    borderLeft: "1px solid #333",
    background: "#000",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  closeBtn: {
    background: "none",
    color: "#f55",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    alignSelf: "flex-end",
  },

  commentList: {
    flex: 1,
    overflowY: "scroll",
    marginTop: "10px",
  },

  commentItem: {
    padding: "8px 0",
    borderBottom: "1px solid #222",
  },

  commentBox: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },

  commentInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    background: "#222",
    color: "#fff",
    border: "1px solid #444",
  },

  sendBtn: {
    padding: "8px 12px",
    background: "#1e90ff",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Feed;
