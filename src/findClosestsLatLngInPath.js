const findClosestCoordinateInPath = (currentLatLng, path) => path
  .reduce(([closestLatlng, closestDistance], currentLatlng) => {
    const {lat: lat1, lng: lng1} = currentLatlng;
    const {lat: lat2, lng: lng2} = latlng;
    const distance = haversine([lat1, lng1], [lat2, lng2], true);
    if (!closestLatlng) return [currentLatlng, distance];
    if (distance < closestDistance) return [currentLatlng, distance];
    return [closestLatlng, closestDistance];
  }, []);
};

export default findClosestCoordinateInPath;
