
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";
import "./ContactForm.css";

function ContactForm(props) {
  const { user } = useOutletContext() || {};
  const [form, setForm] = useState({
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "contacts"), {
        name: user?.name || "",
        surname: user?.surname || "",
        account: user?.email || "",
        message: form.message,
        createdAt: Timestamp.now(),
      });
      alert("Message sent!");
      setForm({ message: "" });
    } catch (error) {
      alert("Error sending message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Message:
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" disabled={loading} className="btnContact">
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;
