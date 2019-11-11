function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

function toRad(x) {
  return x * Math.PI / 180;
}

export const bearing = (lat1, lng1, lat2, lng2) => {
    const startLat = toRad(lat1);
    const startLng = toRad(lng1);
    const destLat = toRad(lat2);
    const destLng = toRad(lng2);

    const y = Math.sin(destLng - startLng) * Math.cos(destLat);
    const x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    const brng = toDegrees(Math.atan2(y, x));
    return (brng + 360) % 360;
};

export const haversine = (coords1, coords2, isMiles) => {
  const lon1 = coords1[0];
  const lat1 = coords1[1];

  const lon2 = coords2[0];
  const lat2 = coords2[1];

  const R = 6371; // km

  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  if (isMiles) return d / 1.60934;

  return d;
};
