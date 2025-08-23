import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import React, { useEffect, useState } from "react";
import "./Edit.css";

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

    // Handle new file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
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
                    const res = await window.axios.post(
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

    const handlePrev = () => {
        setCurrentImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setCurrentImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="add-listing-page container-edit">
            <form className="listing-form" onSubmit={handleSubmit}>
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
                    <span style={{ fontStyle: 'italic', color: '#555' }}>{getFileInputLabel()}</span>
                </label>
                {imagePreviews.length > 0 && (
                    <div className="image-previews">
                        {imagePreviews.map((src, idx) => (
                            <div key={idx} style={{ display: 'inline-block', position: 'relative', marginRight: 8 }}>
                                <img src={src} alt={`preview-${idx}`} style={{ height: 80 }} />
                                <button type="button" onClick={() => {
                                    setNewImages(prev => prev.filter((_, i) => i !== idx));
                                    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                                }} style={{ position: 'absolute', top: 0, right: 0 }}>x</button>
                            </div>

                        ))}
                    </div>
                )}
                <button className="btnAddListing" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>
            <div className="cards">
                {images.length > 0 && (
                    <div className="image-previews">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                className="listing-image-edit"
                                src={images[currentImgIdx]}
                                alt={`Listing ${currentImgIdx + 1}`}
                            />
                            <button className="btnRemoveImage" type="button" onClick={() => handleRemoveExisting(currentImgIdx)} style={{ position: 'absolute', top: 0, right: 0 }}>x</button>
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                                <button className="btnNextBefore" type="button" onClick={handlePrev} style={{ marginRight: 10 }}>
                                    &lt;
                                </button>
                                <span style={{ alignSelf: "center" }}>{currentImgIdx + 1} / {images.length}</span>
                                <button className="btnNextBefore" type="button" onClick={handleNext} style={{ marginLeft: 10 }}>
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