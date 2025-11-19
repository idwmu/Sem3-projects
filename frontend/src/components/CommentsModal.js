import React from "react";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const boxStyle = {
  width: "90%",
  maxWidth: "400px",
  background: "white",
  borderRadius: "8px",
  padding: "20px",
  maxHeight: "80vh",
  overflowY: "auto",
};

const CommentsModal = ({ comments, onClose, onAdd, text, setText }) => {
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <h3>Comments</h3>

        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((c, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <strong>{c.user?.username}</strong>
              <p>{c.text}</p>
            </div>
          ))
        )}

        <input
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            marginTop: "10px",
          }}
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={onAdd}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            background: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Post Comment
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            background: "#ccc",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CommentsModal;
