
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
import './AddListing.css';

import React, { useState, useCallback } from "react";
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';



export default function AddListing() {

    const [form, setForm] = useState({
        address: "",
        price: "",
        numberOfRooms: "",
        apartmentSize: "",
        descriptionAmenities: "",
        images: [],
    });
    const [loading, setLoading] = useState(false);
    const [mapMarker, setMapMarker] = useState(null);
    const [viewState, setViewState] = useState({
        longitude: 21.4254, // Skopje center
        latitude: 41.9981,
        zoom: 12
    });
    const [currentImgIdx, setCurrentImgIdx] = useState(0);

    // Helper to get images array for carousel (from form.images as File[] or string[])
    const images = form.images && form.images.length > 0
        ? (typeof form.images[0] === 'string'
            ? form.images
            : Array.from(form.images).map(file => URL.createObjectURL(file)))
        : [];

    // File input handler (append, don't replace)
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setForm(prev => ({ ...prev, images: [...(prev.images || []), ...files] }));
        setCurrentImgIdx(0);
    };

    // Carousel navigation
    const handlePrev = () => {
        setCurrentImgIdx(idx => (idx === 0 ? images.length - 1 : idx - 1));
    };
    const handleNext = () => {
        setCurrentImgIdx(idx => (idx === images.length - 1 ? 0 : idx + 1));
    };

    // Remove image at current index
    const handleRemoveExisting = (idx) => {
        if (images.length === 0) return;
        const newImages = form.images.filter((_, i) => i !== idx);
        setForm(prev => ({ ...prev, images: newImages }));
        setCurrentImgIdx(i => (i > 0 ? i - 1 : 0));
    };

    // File input label helper
    const getFileInputLabel = () => {
        if (!form.images || form.images.length === 0) return "No images selected";
        if (form.images.length === 1) return form.images[0].name || "1 image selected";
        return `${form.images.length} images selected`;
    };


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // MapTiler geocoding API
    const MAPTILER_KEY = "kWS7KZmpJRLeVMdBOMaI";
    async function geocodeAddress(address) {
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
            return {
                lat: data.features[0].geometry.coordinates[1],
                lng: data.features[0].geometry.coordinates[0],
                display_name: data.features[0].place_name
            };
        }
        return null;
    }

    // Reverse geocoding - get address from coordinates
    async function reverseGeocode(lat, lng) {
        const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
            return data.features[0].place_name;
        }
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    // Handle map click to place pin
    const handleMapClick = useCallback(async (event) => {
        const { lng, lat } = event.lngLat;
        setMapMarker({ longitude: lng, latitude: lat });

        // Get address from coordinates
        const address = await reverseGeocode(lat, lng);
        setForm(prev => ({
            ...prev,
            address: address,
            coordinates: { lat, lng }
        }));
    }, []);

    // On address blur, geocode and update coordinates in form
    const handleAddressBlur = async (e) => {
        const address = e.target.value;
        if (address && address.trim().length > 0) {
            const geo = await geocodeAddress(address);
            if (geo) {
                // Keep the original address input, add coordinates, and move the map pin
                setForm(f => ({ ...f, coordinates: { lat: geo.lat, lng: geo.lng } }));
                setMapMarker({ longitude: geo.lng, latitude: geo.lat });
                setViewState(prev => ({
                    ...prev,
                    longitude: geo.lng,
                    latitude: geo.lat,
                    zoom: 15 // Zoom in to show the specific location
                }));
                console.log(`Geocoded "${address}" to coordinates:`, { lat: geo.lat, lng: geo.lng });
            }
        }
    };




    const CLOUD_NAME = "dd6ryjwgu";
    const UPLOAD_PRESET = "Student Housing App";


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrls = [];
            if (form.images && form.images.length > 0) {
                for (const file of form.images) {
                    const data = new FormData();
                    data.append("file", file);
                    data.append("upload_preset", UPLOAD_PRESET);
                    const res = await axios.post(
                        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                        data
                    );
                    imageUrls.push(res.data.secure_url);
                }
            }
            await addDoc(collection(db, "listings"), {
                address: form.address,
                price: Number(form.price),
                numberOfRooms: Number(form.numberOfRooms),
                apartmentSize: Number(form.apartmentSize),
                descriptionAmenities: form.descriptionAmenities,
                imageUrls: imageUrls,
                landlordId: auth.currentUser ? auth.currentUser.uid : null,
                createdAt: Timestamp.now(),
                coordinates: form.coordinates || null,
            });
            alert("Listing added!");
            setForm({ address: "", price: "", numberOfRooms: "", apartmentSize: "", descriptionAmenities: "", images: [] });
            setCurrentImgIdx(0);
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
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        onBlur={handleAddressBlur}
                        required
                        placeholder="Enter address or click on the map to select location"
                    />
                </label>
                <label>
                    <input
                        type="number"
                        name="apartmentSize"
                        value={form.apartmentSize}
                        onChange={handleChange}
                        placeholder="Apartment size(m²)"
                        required
                    />
                </label>
                <label>
                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="Price"
                        required
                    />
                </label>
                <label>
                    <input
                        type="number"
                        name="numberOfRooms"
                        value={form.numberOfRooms}
                        onChange={handleChange}
                        placeholder="Number of rooms"
                        required
                    />
                </label>
                <label>
                    <textarea
                        name="descriptionAmenities"
                        value={form.descriptionAmenities}
                        onChange={handleChange}
                        placeholder="Describe your apartment..."
                        required
                    />
                </label>
                <label style={{ color: 'gray', fontWeight: 400, fontFamily: "inherit", fontSize: "0.9rem" }}>
                    Add images
                    <input
                        type="file"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="file-input"
                        style={{ marginRight: 8 }}
                    />
                </label>


                <button type="submit" disabled={loading} className="btnAddListing">
                    {loading ? "Saving..." : "Create Listing"}
                </button>
            </form>
            <div className="right-panel">


                <div className="map-container">
                    <Map
                        {...viewState}
                        onMove={evt => setViewState(evt.viewState)}
                        onClick={handleMapClick}
                        mapStyle="https://api.maptiler.com/maps/streets/style.json?key=kWS7KZmpJRLeVMdBOMaI"
                        style={{ width: '100%', height: '100%' }}
                        onLoad={() => console.log('Map loaded successfully')}
                        onError={(error) => console.error('Map error:', error)}
                    >
                        {mapMarker && (
                            <Marker
                                longitude={mapMarker.longitude}
                                latitude={mapMarker.latitude}
                                color="red"
                            />
                        )}
                    </Map>
                </div>
                <div className="image-container">
                    {images.length > 0 && (
                        <div className="image-previews">
                            <div className="image-wrapper">
                                <img
                                    className="listing-image-edit"
                                    src={images[currentImgIdx]}
                                    alt={`Listing ${currentImgIdx + 1}`}
                                />
                                <button
                                    className="btnRemoveImage"
                                    type="button"
                                    onClick={() => handleRemoveExisting(currentImgIdx)}
                                >
                                    ×
                                </button>
                            </div>

                            {images.length > 1 && (
                                <div className="carousel-controls">
                                    <button className="btnNextBefore" type="button" onClick={handlePrev}>
                                        &lt;
                                    </button>
                                    <span>{currentImgIdx + 1} / {images.length}</span>
                                    <button className="btnNextBefore" type="button" onClick={handleNext}>
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

