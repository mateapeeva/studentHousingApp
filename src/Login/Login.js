import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db} from '../firebase.js'
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await userCredential.user.reload();
            const freshUser = auth.currentUser;

             if (!freshUser.emailVerified) {
                alert("Please verify your email before logging in.");
                await signOut(auth);
                return;
            }

            setError("");
            alert("Login successful!");
            const userRef = doc(db,"users", freshUser.uid);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists() && userSnap.data().role === "Landlord"){
                navigate("/dashboard");
            }else if(userSnap.exists() && userSnap.data().role === "Student"){
                navigate("/student-dashboard");
            }
        } catch (error){
            setError(error.message);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    const pendingData = localStorage.getItem("pendingUserData");
                    if (pendingData) {
                        const { name, surname, role } = JSON.parse(pendingData);
                        await setDoc(userRef, {
                            name,
                            surname,
                            email: user.email,
                            role,
                        });
                        localStorage.removeItem("pendingUserData");
                        alert("Your account is now fully set up!");
                    }
                }
            } else if (user && !user.emailVerified) {
                alert("Please verify your email before accessing the app.");
            }
        });

        return () => unsubscribe();
    }, []);

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