import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { doc, QueryEndAtConstraint, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './SignUp.css';

export default function SignUp() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !surname || !email || !password || !confirmPassword || !role) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);

            localStorage.setItem(
                "pendingUserData",
                JSON.stringify({ name, surname, email, role })
            );


            setError("");
            alert("Verification email sent! Please verify your email before logging in.");
            await signOut(auth);

            navigate("/login");
        }
        catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please use another email or log in.");
            } else {
                setError(error.message);
            }
        }
    };

    return (
        <div className="containerSignUp">
            <form onSubmit={handleSubmit} className="formSignUp">
                <h1>Sign Up</h1>
                <div className="role-selection">
                    <label className={role === "Student" ? "selected" : ""}>
                        <input
                            type="radio"
                            placeholder="Student"
                            value="Student"
                            checked={role === "Student"}
                            onChange={(e) => setRole(e.target.value)}
                            className="inputRole"
                        />
                        Student
                    </label>
                    <label className={role === "Landlord" ? "selected" : ""}>
                        <input
                            type="radio"
                            placeholder="Landlord"
                            value="Landlord"
                            checked={role === "Landlord"}
                            onChange={(e) => setRole(e.target.value)}
                            className="inputRole"

                        />
                        Landlord
                    </label>
                </div>
                <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="inputData"
                />
                <input
                    type="text"
                    placeholder="Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="inputData"
                />
                <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="inputData"
                />
                <input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="inputData"
                />
                <input
                    type="password"
                    placeholder="Your password again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="inputData"
                />
                <button className="btnSignUp" type="submit">Sign Up</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}