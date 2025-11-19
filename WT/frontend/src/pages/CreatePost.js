import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFile = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!description && !imageFile) return alert("Add a description or an image.");

    const fd = new FormData();
    fd.append("description", description);
    fd.append("location", location);
    if (imageFile) fd.append("image", imageFile);

    try {
      setLoading(true);
      await API.post("/posts", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLoading(false);
      navigate("/feed");
    } catch (err) {
      setLoading(false);
      console.error("Create post failed", err);
      alert("Failed to create post.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>RideUp</h1>
        <button style={styles.sideButton} onClick={() => navigate("/feed")}>🏠 Feed</button>
        <button style={styles.sideButton} onClick={() => navigate("/profile")}>👤 Profile</button>
        <button style={{ ...styles.sideButton, marginTop: "auto" }} onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
        }}>Logout</button>
      </div>

      <main style={styles.center}>
        <div style={styles.formCard}>
          <h2 style={{ marginTop: 0 }}>Create New Post</h2>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              placeholder="Write something about your ride..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
            />

            <input
              placeholder="Location (city, landmark...)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
            />

            <label style={styles.fileLabel}>
              {imageFile ? "Change Image" : "Choose Image"}
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>

            {preview && (
              <div style={styles.previewWrap}>
                <img src={preview} alt="preview" style={styles.preview} />
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={styles.postBtn} disabled={loading}>
                {loading ? "Posting..." : "Post"}
              </button>

              <button type="button" style={styles.cancelBtn} onClick={() => navigate("/feed")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <aside style={styles.rightCol}>
        <div style={styles.rightBox}>
          <h4 style={{ marginTop: 0 }}>Upload tips</h4>
          <ul style={{ paddingLeft: 18, color: "#bfbfbf" }}>
            <li>Square or wide images work best.</li>
            <li>Keep caption short and clear.</li>
            <li>Use public locations so others discover your rides.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#070707",
    color: "#eef2f5",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  sidebar: {
    width: 220,
    padding: 20,
    borderRight: "1px solid #222",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#040404",
  },

  logo: { margin: 0 },

  sideButton: {
    padding: 10,
    background: "#141414",
    border: "1px solid #2a2a2a",
    color: "#e9eef1",
    textAlign: "left",
    cursor: "pointer",
    borderRadius: 6,
  },

  center: {
    flex: 1,
    padding: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  formCard: {
    width: 700,
    background: "#0f0f10",
    border: "1px solid #222",
    padding: 20,
    borderRadius: 10,
  },

  textarea: {
    minHeight: 120,
    padding: 12,
    borderRadius: 8,
    background: "#121212",
    color: "#fff",
    border: "1px solid #2a2a2a",
  },

  input: {
    padding: 10,
    borderRadius: 8,
    background: "#121212",
    color: "#fff",
    border: "1px solid #2a2a2a",
  },

  fileLabel: {
    display: "inline-block",
    padding: "8px 12px",
    background: "#1a73e8",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 6,
    width: 150,
    textAlign: "center",
  },

  previewWrap: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
    background: "#000",
  },

  preview: {
    width: "100%",
    height: "auto",
    display: "block",
  },

  postBtn: {
    padding: "10px 16px",
    background: "#1e90ff",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },

  cancelBtn: {
    padding: "10px 16px",
    background: "#333",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
  },

  rightCol: {
    width: 260,
    padding: 20,
    borderLeft: "1px solid #222",
    background: "#040404",
  },

  rightBox: {
    background: "#0c0c0c",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #222",
  },
};

export default CreatePost;
