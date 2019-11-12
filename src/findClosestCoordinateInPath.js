import haversine from './haversine';

const findClosestCoordinateInPath = (latlng, path) => path
  .reduce(([closestCoordinate, closestDistance], currentLatlng) => {
    const {lat: lat1, lng: lng1} = currentLatlng;
    const {lat: lat2, lng: lng2} = latlng;
    const distance = haversine([lat1, lng1], [lat2, lng2], true);
    if (!closestCoordinate) return [currentLatlng, distance];
    if (distance < closestDistance) return [currentLatlng, distance];
    return [closestCoordinate, closestDistance];
  }, []);

export default findClosestCoordinateInPath;
