import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const CreateRide = () => {
  const [title, setTitle] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title || !startLocation || !destination || !date || !time) {
      alert("Please fill required fields");
      return;
    }
    try {
      await API.post("/rides", { title, startLocation, destination, date, time, description });
      navigate("/feed");
    } catch (err) {
      console.log("Create ride error", err);
      alert("Could not create ride");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Create a Ride Request</h2>

        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} />
        <input placeholder="Start location" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} style={styles.input} />
        <input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} style={styles.input} />
        <div style={{display:"flex", gap:8}}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={styles.input} />
        </div>
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} style={{...styles.input, height:100}} />

        <button onClick={handleSubmit} style={styles.button}>Post Ride</button>
      </div>
    </div>
  );
};

const styles = {
  container: { display:"flex", justifyContent:"center", padding:20 },
  card: { width:520, background:"#101010", padding:20, borderRadius:8, color:"#fff", border:"1px solid #222" },
  input: { width:"100%", padding:10, marginBottom:10, borderRadius:6, background:"#111", border:"1px solid #222", color:"#fff" },
  button: { padding:12, background:"#1DA1F2", color:"#fff", border:"none", borderRadius:6, cursor:"pointer" }
};

export default CreateRide;
