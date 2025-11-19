import React, { useEffect, useState } from "react";
import API from "../services/api";

const Notifications = () => {
  const [notes, setNotes] = useState([]);
  useEffect(() => { fetch(); }, []);
  const fetch = async () => {
    try {
      const res = await API.get("/user/notifications");
      setNotes(res.data);
    } catch (err) { console.log(err); }
  };
  const markRead = async (id) => {
    try {
      await API.patch(`/user/notifications/${id}/read`);
      setNotes((prev) => prev.map(n => n._id === id ? {...n, read:true} : n));
    } catch (err) { console.log(err); }
  };
  return (
    <div style={{padding:20, color:"#fff"}}>
      <h2>Notifications</h2>
      {notes.length===0 ? <p>No notifications</p> : notes.map(n => (
        <div key={n._id} style={{padding:8, background: n.read ? "#111" : "#222", marginBottom:8}}>
          <strong>{n.from?.username || "Someone"}</strong> {n.type} {n.post ? "on your post" : ""}
          <div style={{fontSize:12, color:"#aaa"}}>{new Date(n.createdAt).toLocaleString()}</div>
          {!n.read && <button onClick={() => markRead(n._id)}>Mark read</button>}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
