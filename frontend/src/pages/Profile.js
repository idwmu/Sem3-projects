import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams(); // viewing someone else’s profile if exists
  const navigate = useNavigate();

  const [user, setUser] = useState({ username: "", bio: "", followers: [], following: [] });
  const [posts, setPosts] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "" });
  const [profilePicFile, setProfilePicFile] = useState(null);

  const [isFollowing, setIsFollowing] = useState(false);

  // ---------------- FETCH PROFILE ----------------
  const loadProfile = async () => {
    try {
      const viewingAnotherUser = Boolean(id);

      // Fetch profile data
      const res = await API.get(viewingAnotherUser ? `/user/${id}` : "/user/me");
      const profile = res.data;
      setUser(profile);

      // Check owner
      const meRes = await API.get("/user/me");
      const myId = meRes.data._id;
      setIsOwner(!id || id === myId);

      setForm({ username: profile.username, bio: profile.bio || "" });

      // Check follow status if you're looking at someone else
      if (id) {
        const me = meRes.data;
        setIsFollowing(me.following?.includes(profile._id));
      }

      // Fetch posts for the user
      if (isOwner) {
        const postRes = await API.get("/user/my-posts");
        setPosts(postRes.data);
      } else {
        const postRes = await API.get(`/posts?user=${profile._id}`);
        setPosts(postRes.data);
      }

    } catch (err) {
      console.error("Profile load error", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  // ---------------- SAVE PROFILE ----------------
  const saveProfile = async () => {
    try {
      const data = new FormData();
      data.append("username", form.username);
      data.append("bio", form.bio);
      if (profilePicFile) data.append("profilePic", profilePicFile);

      const res = await API.patch("/user/me", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUser(res.data.user);
      setEditing(false);
    } catch (err) {
      console.log("Save profile error", err);
    }
  };

  // ---------------- FOLLOW / UNFOLLOW ----------------
  const follow = async () => {
    try {
      await API.post(`/user/follow/${user._id}`);
      setIsFollowing(true);
      loadProfile();
    } catch (err) {
      console.log(err);
    }
  };

  const unfollow = async () => {
    try {
      await API.post(`/user/unfollow/${user._id}`);
      setIsFollowing(false);
      loadProfile();
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- DELETE POST ----------------
  const deletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.log("Delete error", err);
    }
  };

  return (
    <div style={styles.page}>

      {/* LEFT SIDEBAR — EXACTLY LIKE OLD VERSION */}
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

      {/* CENTER */}
      <main style={styles.center}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>
              {user.username ? user.username[0].toUpperCase() : "U"}
            </span>
          </div>

          <div style={styles.headerInfo}>
            <h2>@{user.username}</h2>
            <p style={styles.bio}>{user.bio || "No bio yet."}</p>

            <div style={styles.stats}>
              <div style={styles.stat}><strong>{posts.length}</strong><div style={styles.small}>Posts</div></div>
              <div style={styles.stat}><strong>{user.followers?.length || 0}</strong><div style={styles.small}>Followers</div></div>
              <div style={styles.stat}><strong>{user.following?.length || 0}</strong><div style={styles.small}>Following</div></div>
            </div>

            {/* FOLLOW / EDIT BUTTON */}
            {isOwner ? (
              <button
                style={{ ...styles.sideButton, marginTop: 10 }}
                onClick={() => setEditing(true)}
              >
                ✏ Edit Profile
              </button>
            ) : (
              <button
                style={{ ...styles.sideButton, marginTop: 10 }}
                onClick={isFollowing ? unfollow : follow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* POSTS */}
        <section style={styles.postsSection}>
          {posts.length === 0 ? (
            <div style={styles.emptyMsg}>No posts yet.</div>
          ) : (
            posts.map((p) => (
              <article key={p._id} style={styles.postCard}>
                <p style={styles.description}>{p.description}</p>

                {p.image && (
                  <div style={styles.postImageWrap}>
                    <img
                      src={`http://localhost:8000/uploads/${p.image}`}
                      style={styles.postImage}
                      alt=""
                    />
                  </div>
                )}

                <div style={styles.metaRow}>
                  <span>📍 {p.location}</span>
                  <span>• {new Date(p.createdAt).toLocaleString()}</span>
                </div>

                {isOwner && (
                  <button style={styles.deleteBtn} onClick={() => deletePost(p._id)}>
                    🗑 Delete
                  </button>
                )}
              </article>
            ))
          )}
        </section>

        {/* EDIT MODAL */}
        {editing && (
          <div style={styles.modal}>
            <h3>Edit Profile</h3>

            <input
              style={styles.input}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <textarea
              style={styles.input}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />

            <input type="file" onChange={(e) => setProfilePicFile(e.target.files[0])} />

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button style={styles.saveBtn} onClick={saveProfile}>Save</button>
              <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}

      </main>

      {/* RIGHT EMPTY COLUMN (keep layout consistent) */}
      <div style={styles.rightCol}></div>

    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#0b0b0b",
    color: "#e9eef1",
  },

  sidebar: {
    width: 220,
    padding: 20,
    background: "#070707",
    borderRight: "1px solid #222",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  logo: { margin: 0 },

  sideButton: {
    padding: 10,
    background: "#141414",
    border: "1px solid #2a2a2a",
    color: "#e9eef1",
    cursor: "pointer",
    borderRadius: 6,
    textAlign: "left",
  },

  center: {
    flex: 1,
    padding: 24,
    overflowY: "auto",
    maxWidth: 900,
    margin: "0 auto",
  },

  header: {
    display: "flex",
    gap: 20,
    marginBottom: 24,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "#222",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { fontSize: 34 },

  headerInfo: { display: "flex", flexDirection: "column" },

  bio: { color: "#aaa" },

  stats: { display: "flex", gap: 20, marginTop: 10 },

  stat: { textAlign: "center" },

  small: { fontSize: 12, color: "#888" },

  postsSection: { display: "flex", flexDirection: "column", gap: 20 },

  postCard: {
    background: "#111",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #222",
  },

  description: { marginBottom: 10 },

  postImageWrap: {
    width: "100%",
    background: "#000",
    borderRadius: 10,
    overflow: "hidden",
  },

  postImage: {
    width: "100%",
    objectFit: "contain",
  },

  metaRow: {
    marginTop: 10,
    fontSize: 13,
    color: "#999",
    display: "flex",
    gap: 10,
  },

  deleteBtn: {
    marginTop: 10,
    padding: 8,
    background: "#a00",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    width: "100%",
  },

  rightCol: {
    width: 260,
    background: "#070707",
    borderLeft: "1px solid #222",
  },

  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#111",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    width: 320,
  },

  input: {
    marginTop: 10,
    padding: 10,
    background: "#222",
    border: "1px solid #444",
    color: "#fff",
    borderRadius: 6,
  },

  saveBtn: {
    padding: 10,
    background: "#1da1f2",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    flex: 1,
  },

  cancelBtn: {
    padding: 10,
    background: "#444",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    flex: 1,
  },
};

export default Profile;
