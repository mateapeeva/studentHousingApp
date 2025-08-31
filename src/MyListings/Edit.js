import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import React, { useEffect, useState } from "react";
import "./Edit.css";
import axios from "axios";

function Edit() {
    // Helper for file input label
    const getFileInputLabel = () => {
        if (!newImages || newImages.length === 0) return 'No files selected.';
        if (newImages.length === 1) return '1 file selected.';
        return `${newImages.length} files selected.`;
    };
    const [images, setImages] = useState([]); // existing image URLs
    const [imagePreviews, setImagePreviews] = useState([]); // new image previews
    const [newImages, setNewImages] = useState([]); // new image files
    const CLOUD_NAME = "dd6ryjwgu"; // TODO: Replace with your Cloudinary cloud name
    const UPLOAD_PRESET = "Student Housing App"; // TODO: Replace with your unsigned upload preset

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle new file selection (append, don't replace)
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    };

    // Remove existing image
    const handleRemoveExisting = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        if (currentImgIdx >= images.length - 1 && currentImgIdx > 0) setCurrentImgIdx(currentImgIdx - 1);
    };

    // Remove new image
    const handleRemoveNew = (idx) => {
        setNewImages(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let uploadedUrls = [];
            if (newImages.length > 0) {
                for (const file of newImages) {
                    const data = new FormData();
                    data.append("file", file);
                    data.append("upload_preset", UPLOAD_PRESET);
                    const res = await axios.post(
                        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                        data
                    );
                    uploadedUrls.push(res.data.secure_url);
                }
            }
            const docRef = doc(db, "listings", id);
            await updateDoc(docRef, {
                address: form.address,
                apartmentSize: Number(form.apartmentSize),
                price: Number(form.price),
                numberOfRooms: Number(form.numberOfRooms),
                descriptionAmenities: form.descriptionAmenities,
                imageUrls: [...images, ...uploadedUrls],
            });
            setNewImages([]);
            setImagePreviews([]);
            alert("Listing updated!");
        } catch (error) {
            alert("Error updating listing: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const { id } = useParams();
    const [form, setForm] = useState({
        address: '',
        apartmentSize: '',
        price: '',
        numberOfRooms: '',
        descriptionAmenities: '',
    });
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            const docRef = doc(db, "listings", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setForm({
                    address: data.address || '',
                    apartmentSize: data.apartmentSize || '',
                    price: data.price || '',
                    numberOfRooms: data.numberOfRooms || '',
                    descriptionAmenities: data.descriptionAmenities || '',
                });
                setImages(data.imageUrls || []);
            }
        };
        fetchListing();
    }, [id]);

    // Combine existing and new image previews for the carousel
    const allImages = [...images, ...imagePreviews];
    const handlePrev = () => {
        setCurrentImgIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setCurrentImgIdx((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    // Remove image at current index (from either images or imagePreviews)
    const handleRemoveAt = (idx) => {
        if (idx < images.length) {
            setImages(prev => prev.filter((_, i) => i !== idx));
        } else {
            const newIdx = idx - images.length;
            setNewImages(prev => prev.filter((_, i) => i !== newIdx));
            setImagePreviews(prev => prev.filter((_, i) => i !== newIdx));
        }
        setCurrentImgIdx(i => (i > 0 ? i - 1 : 0));
    };

    return (
        <div className="container-edit">
            <form className="edit-form" onSubmit={handleSubmit}>
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
                <label>
                    Add Images:
                    <input
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ marginRight: 8 }}
                    />
                </label>
                {/* Removed separate imagePreviews rendering; unified carousel below handles all images */}
                <button className="btnEditSave" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>
            <div className="edit-image-container">
                {allImages.length > 0 && (
                    <div className="edit-image-previews">
                        <div className="edit-image-wrapper">
                            <img
                                src={allImages[currentImgIdx]}
                                alt={`Listing ${currentImgIdx + 1}`}
                            />
                            <button
                                className="btnRemoveImage"
                                type="button"
                                onClick={() => handleRemoveAt(currentImgIdx)}
                            >
                                ×
                            </button>
                        </div>
                        {allImages.length > 1 && (
                            <div className="edit-carousel-controls">
                                <button className="btnNextBeforeEdit" type="button" onClick={handlePrev}>
                                    &lt;
                                </button>
                                <span>{currentImgIdx + 1} / {allImages.length}</span>
                                <button className="btnNextBeforeEdit" type="button" onClick={handleNext}>
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Edit;