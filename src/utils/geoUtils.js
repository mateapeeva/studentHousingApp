// Distance calculation using Haversine formula
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

// Filter listings by radius from a center point
export function filterListingsByRadius(listings, centerLat, centerLng, radiusKm) {
  return listings.filter(listing => {
    if (!listing.coordinates || !listing.coordinates.lat || !listing.coordinates.lng) {
      return false; // Skip listings without coordinates
    }
    
    const distance = calculateDistance(
      centerLat, 
      centerLng, 
      listing.coordinates.lat, 
      listing.coordinates.lng
    );
    
    return distance <= radiusKm;
  });
}
