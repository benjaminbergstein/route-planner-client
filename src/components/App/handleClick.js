import flatten from 'lodash/flatten';
import findClosestCoordinateInPath from '../../findClosestCoordinateInPath';

const findClosetCoordinate = ({
  latlng,
  path,
  lines,
}) => {
  const [closestCoordinateInPath, closestCoordinateDistanceInPath] = findClosestCoordinateInPath(latlng, path);
  const [closestCoordinateInWaypoints, closestCoordinateDistanceInWaypoints] = findClosestCoordinateInPath(
    latlng,
    flatten(lines).map(
      ([lat, lng]) => ({ lat, lng })
    )
  );

  return (
    closestCoordinateDistanceInPath < closestCoordinateDistanceInWaypoints ?
    [closestCoordinateInPath, closestCoordinateDistanceInPath, 'path'] :
    [closestCoordinateInWaypoints, closestCoordinateDistanceInWaypoints, 'waypoint']
  );
};

const determineAppendLocation = ({ targetLatLng, lines, path }) => {
  return lines.reduce((found, line, index) => {
    if (found) return found;
    const { lat, lng } = targetLatLng;
    const foundInLine = line.reduce((foundInLine, [lat2, lng2]) => {
      if (foundInLine) return foundInLine;
      if (lat === lat2 && lng === lng2) return true;
    }, false);
    if (foundInLine) return path[index];
    return false;
  }, false);
}

const handleClick = ({
  latlng,
  appendPoint,
  movePoint,
  setTarget,
  target,
  clearTarget,
  targetType,
  targetData,
  getTargetState,
  trackEvent,
  path,
  lines,
  zoom,
}) => {
  const targetState = getTargetState();
  const FUZZ_FACTOR = (31 - zoom) / 2 / 100;

  const [
    closestCoordinate,
    closestCoordinateDistance,
    closestCoordinateType
  ] = findClosetCoordinate({ latlng, path, lines })

  if (target) {
    const { latlng: targetLatLng } = targetData;
    if (targetType === 'path') {
      movePoint(targetLatLng, latlng);
    } else {
      const after = determineAppendLocation({ targetLatLng, lines, path });
      appendPoint({ latlng, after });
    }
    clearTarget();
    trackEvent({ action: 'appendPoint:insert' })
  } else if (!closestCoordinate || closestCoordinateDistance > FUZZ_FACTOR) {
    appendPoint({ latlng });
    trackEvent({ action: 'appendPoint:push' })
  } else {
    setTarget(closestCoordinateType, closestCoordinate, { latlng: closestCoordinate });
  }
};

export default handleClick;
