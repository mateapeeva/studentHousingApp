import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from "react-router-dom";
import './FindRoommate.css';
import { auth } from "../firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import {faPhone, faGraduationCap} from '@fortawesome/free-solid-svg-icons';


const FindRoommate = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    const handleRoommateSubmit = async (e) => {
        e.preventDefault();
        setRoommateError("");
        setRoommateSuccess(false);
        let success = false;
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const userDocRef = doc(db, "studentsLookingForRoommates", auth.currentUser.uid);
            await setDoc(userDocRef, {
                ...roommateForm,
                createdAt: new Date()
            }, { merge: true });
            setRoommateSuccess(true);
            success = true;
        } catch (err) {
            setRoommateError("Failed to save. Please try again.");
            success = false;
        }
        if (success) {
            alert("Successfully saved!");
        } else {
            alert("Failed to save. Please try again.");
        }
        setShowPopup(false);
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (auth.currentUser) {
                const roommateRef = doc(db, "studentsLookingForRoommates", auth.currentUser.uid);
                const roommateSnap = await getDoc(roommateRef);
                if (roommateSnap.exists()) {
                    setRoommateForm(roommateSnap.data());
                } else {
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setRoommateForm((prev) => ({
                            ...prev,
                            name: userData.name || "",
                            surname: userData.surname || "",
                        }));
                    }
                }
            }
        };
        fetchUserInfo();
    }, [showPopup]);

    const [roommateForm, setRoommateForm] = useState({
        name: "",
        surname: "",
        phone: "",
        instagram: "",
        faculty: "",
    });
    const [roommateSuccess, setRoommateSuccess] = useState(false);
    const [roommateError, setRoommateError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'studentsLookingForRoommates'));
                let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (auth.currentUser) {
                    data = data.filter(student => student.id !== auth.currentUser.uid);
                }
                setStudents(data);
            } catch (err) {
                setStudents([]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <button
                className="btnRoommate"
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1100,
                    marginBottom: 0,
                    alignSelf: 'auto'
                }}
                onClick={() => setShowPopup(true)}
            >
                Edit Profile
            </button>
            <div>
                {students.map(student => (
                    <div
                        key={student.id}
                        className='studentCard'
                    >
                        <h3 style={{ textAlign: 'center' }}>{student.name} {student.surname}</h3>
                        {student.profile && (
                            <img src={student.profile} alt="Profile" style={{ width: '100%', borderRadius: '8px', marginBottom: 8 }} />
                        )}
                        <p className='infoRoommate'><span><FontAwesomeIcon icon={faPhone} className="iconRoommate" /></span> {student.phone}</p>
                        <p className='infoRoommate'><span><FontAwesomeIcon icon={faInstagram} className="iconRoommate" /></span> {student.instagram}</p>
                        <p className='infoRoommate'><span><FontAwesomeIcon icon={faGraduationCap} className="iconRoommate" /></span> {student.faculty}</p>
                        {student.appliedApartments && student.appliedApartments.length > 0 && (
                            <p style={{ fontSize: '0.95em', color: '#555' }}><b>Applied Apartments:</b> {student.appliedApartments.join(', ')}</p>
                        )}
                    </div>
                ))}
            </div>
            {showPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 200, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                        <form className="roommates" onSubmit={handleRoommateSubmit}>
                            <label>
                                <span><FontAwesomeIcon icon={faPhone} className="iconRoommate" />Phone Number</span>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={roommateForm.phone}
                                    onChange={e => setRoommateForm({ ...roommateForm, phone: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span><FontAwesomeIcon icon={faInstagram} className="iconRoommate" />Instagram</span>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={roommateForm.instagram}
                                    onChange={e => setRoommateForm({ ...roommateForm, instagram: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                <span><FontAwesomeIcon icon={faGraduationCap} className="iconRoommate" />Faculty</span>
                                <input
                                    type="text"
                                    name="roommateFaculty"
                                    value={roommateForm.faculty}
                                    onChange={e => setRoommateForm({ ...roommateForm, faculty: e.target.value })}
                                    required
                                />
                            </label>
                            <button className="btnRoommate" style={{ marginTop: '12px', marginBottom: '-10px' }}>Save your info</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindRoommate;