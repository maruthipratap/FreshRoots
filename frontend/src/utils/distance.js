// Haversine formula — calculates distance between 2 coordinates in km
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// Returns a label like "2 km" or "150 km"
export function getDistanceLabel(lat1, lng1, lat2, lng2) {
  const km = getDistanceKm(lat1, lng1, lat2, lng2)
  if (km < 1) return '< 1 km'
  return `${km} km`
}