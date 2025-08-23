
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
import './AddListing.css';

export default function AddListing() {
    // Remove selected image
    const handleRemoveImage = () => {
        setForm(prev => ({ ...prev, image: null }));
        setImagePreview("");
    };
    // Helper for file input label
    const getFileInputLabel = () => {
        if (!form.image) return 'No file selected.';
        return '1 file selected.';
    };
    const [form, setForm] = useState({
        address: "",
        price: "",
        numberOfRooms: "",
        apartmentSize: "",
        descriptionAmenities: "",
        image: null,
    });
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, image: file });
        setImagePreview(file ? URL.createObjectURL(file) : "");
    };

    const CLOUD_NAME = "dd6ryjwgu"; 
    const UPLOAD_PRESET = "Student Housing App"; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            if (form.image) {
                const data = new FormData();
                data.append("file", form.image);
                data.append("upload_preset", UPLOAD_PRESET);
                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    data
                );
                imageUrl = res.data.secure_url;
            }
            await addDoc(collection(db, "listings"), {
                address: form.address,
                price: Number(form.price),
                numberOfRooms: Number(form.numberOfRooms),
                apartmentSize: Number(form.apartmentSize),
                descriptionAmenities: form.descriptionAmenities,
                imageUrl: imageUrl,
                createdAt: Timestamp.now(),
            });
            alert("Listing added!");
            setForm({ address: "", price: "", numberOfRooms: "", apartmentSize: "", descriptionAmenities: "", image: null });
            setImagePreview("");
        } catch (error) {
            alert("Error adding listing: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="add-listing-page">
            <form className="listing-form" onSubmit={handleSubmit}>
                <label>
                    Address:
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Apartment Size(m²):
                    <input
                        type="number"
                        name="apartmentSize"
                        value={form.apartmentSize}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Price:
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Number of Rooms:
                    <input
                        type="number"
                        name="numberOfRooms"
                        value={form.numberOfRooms}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        name="descriptionAmenities"
                        value={form.descriptionAmenities}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label style={{ display: 'block', marginBottom: 8 }}>
                    Add Images:
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ marginRight: 8 }}
                    />
                    <span
                        style={{
                            fontStyle: 'italic',
                            color: '#555',
                            display: 'block',
                            textAlign: 'center',
                            marginTop: 4
                        }}
                    >
                        {getFileInputLabel()}
                    </span>
                </label>
                {imagePreview && (
                    <div className="image-previews" style={{ display: 'inline-block', position: 'relative', marginRight: 8 }}>
                        <img src={imagePreview} alt="preview" style={{ height: 80 }} />
                        <button type="button" onClick={handleRemoveImage} style={{ position: 'absolute', top: 0, right: 0 }}>x</button>
                    </div>
                )}
                <button type="submit" disabled={loading} className="btnAddListing">
                    {loading ? "Saving..." : "Create Listing"}
                </button>
            </form>
            <div className="cards">
                <div className="cardTips">
                    <h3>Tips for Creating a Great Listing</h3>
                    <ul>
                        <li>Use high-quality images to showcase your property.</li>
                        <li>Provide accurate and detailed descriptions.</li>
                        <li>Set a competitive price based on market research.</li>
                    </ul>
                </div>
                <div className="cardTips">
                    <h3>Tips for Creating a Great Listing</h3>
                    <ul>
                        <li>Use high-quality images to showcase your property.</li>
                        <li>Provide accurate and detailed descriptions.</li>
                        <li>Set a competitive price based on market research.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

