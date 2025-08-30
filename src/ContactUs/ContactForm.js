
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";
import "./ContactForm.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faGithub, faInstagram, faTelegram } from '@fortawesome/free-brands-svg-icons';

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
      <div className="infoText">
        <p>Thank you for reaching out! </p>
        <p>You can leave your message here or contact us via</p>
        <div className="iconContainer">
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
          <FontAwesomeIcon icon={faGithub} className="icon" />
          <FontAwesomeIcon icon={faInstagram} className="icon" />
          <FontAwesomeIcon icon={faTelegram} className="icon" />
        </div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Write your message here..."
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
