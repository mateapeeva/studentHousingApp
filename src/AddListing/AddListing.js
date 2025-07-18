import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import './AddListing.css';

export default function AddListing() {
    const [form, setForm] = useState({
        address: "",
        price: "",
        numberOfRooms: "",
        apartmentSize: "",
        description: "",
        // images: [],
    });
    const [loading, setLoading] = useState(false);
    // const [imagePreviews, setImagePreviews] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // const handleFileChange = (e) => {
    //     const files = Array.from(e.target.files);
    //     setForm({ ...form, images: files });
    //     setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // const imageUrls = [];
            // for (const file of form.images) {
            //     const storageRef = ref(storage, `listings/${Date.now()}-${file.name}`);
            //     await uploadBytes(storageRef, file);
            //     const url = await getDownloadURL(storageRef);
            //     imageUrls.push(url);
            // }
            await addDoc(collection(db, "listings"), {
                address: form.address,
                price: Number(form.price),
                numberOfRooms: Number(form.numberOfRooms),
                apartmentSize: Number(form.apartmentSize),
                descriptionAmenities: form.descriptionAmenities,
                // images: imageUrls,
                createdAt: Timestamp.now(),
            });
            alert("Listing added!");
            setForm({ address: "", price: "", numberOfRooms: "", apartmentSize: "", descriptionAmenities: "", images: [] });
            // setImagePreviews([]);
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
                {/* <label>
                    Images:
                    <input
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
                {imagePreviews.length > 0 && (
                    <div className="image-previews">
                        {imagePreviews.map((src, idx) => (
                            <img src={src} alt="preview" key={idx} style={{ height: 80, marginRight: 8 }} />
                        ))}
                    </div>
                )} */}
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

