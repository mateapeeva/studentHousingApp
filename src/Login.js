import React, { useState } from 'react';
import { auth } from './firebase.js'
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            await signInWithEmailAndPassword(auth, email, password);
            setError("");
            alert("Login successful!");
        } catch (error){
            setError(error.message);
        }
    };

    return(
        
        <div>
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                <input
                    type="email"
                    value = {email}
                    placeholder = "Your email adress"
                    onChange = {(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    value = {password}
                    placeholder = "Your password"
                    onChange = {(e) => setPassword(e.target.value)}
                    required
                />
                <button className='btn' type="submit">Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
        
    );
}