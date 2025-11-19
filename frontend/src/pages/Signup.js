import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await API.post("/auth/register", { username, email, password });
      navigate("/login");
    } catch (err) {
      alert("Failed to create account");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Create Account</h2>

        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleSignup}>
          Sign Up
        </button>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "#000",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
    color: "white",
  },

  box: {
    width: "380px",
    padding: "35px",
    background: "#111",
    borderRadius: "12px",
    border: "1px solid #333",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  title: {
    textAlign: "center",
  },

  input: {
    padding: "12px",
    background: "#222",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "white",
    outline: "none",
  },

  button: {
    padding: "12px",
    background: "#1DA1F2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "10px",
  },

  switchText: {
    textAlign: "center",
    marginTop: "10px",
    fontSize: "14px",
  },

  link: {
    color: "#1DA1F2",
    cursor: "pointer",
  },
};

export default Signup;
