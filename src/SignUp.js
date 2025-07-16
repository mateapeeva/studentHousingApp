import React, {useState} from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, QueryEndAtConstraint, setDoc } from "firebase/firestore";
import './SignUp.css';

export default function SignUp() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!name || !surname || !email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if(password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", userCredential.user.uid), {
                name,
                surname,
                email
            });
            // Create a user document in Firestore

            setError("");
            alert("User created successfully!");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Sign Up</h1>
                <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Your password again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="btn" type="submit">Sign Up</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}