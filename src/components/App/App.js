import React from 'react';
import compose from 'recompose/compose';
import { Map, TileLayer, Marker, Circle, Pane } from 'react-leaflet';
import L from 'leaflet';

import withRoute from '../../containers/withRoute/index';
import withTarget, { TARGET_MODES } from '../../containers/withTarget';
import withLocationHash from '../../containers/withLocationHash';
import withBrowser from '../../containers/withBrowser';
import withTrackEvent from '../../containers/withTrackEvent';
import withDragging from '../../containers/withDragging';
import { ControlsPanel, Button } from '../Controls';
import RoutePlotter from '../RoutePlotter';
import { haversine, bearing } from '../../haversine';

const TriangleIcon = (bearing) => `
<div
  style="width: 0; height: 0; border-style: solid; border-width: 7.5px 30px 7.5px 0; border-color: transparent #5494ff transparent transparent; transform: rotate(${bearing}deg)">
</div>
`;

const determineBounds = ({ loading, path }) => {
  if (loading && path.length > 0) {
    const group = new L.featureGroup(path.map((p) => L.marker(p)));
    return group.getBounds();
  }

  return undefined;
};

const INIITAL_CENTER = {
  center: [37.773033, -122.438811],
  zoom: "15",
};

class AnimatedCircle extends React.Component {
  constructor(props) {
    super(props);
    this.OPACITIES = [1, 2, 3, 4, 5].reduce((list, i) => {
      return [0.85 - i * 0.06, ...list, 0.85 - i * 0.06];
    }, [0.85]);
    this.state = { opacity: 0 };

    setInterval(() => {
      const { opacity } = this.state;
      this.setState({ opacity: opacity + 1 });
    }, 100)
  }

  render() {
    const { opacity } = this.state;

    return <Circle
      {...this.props}
      fillOpacity={this.OPACITIES[opacity % this.OPACITIES.length]}
    />;
  }
};

const calculateBearing = (userLocation, lines) => {
  if (userLocation) {
    const distanceReducer = (d2, coord) => [
      ...d2,
      [haversine(Object.values(userLocation), coord, true), coord]
    ];

    const coordinatesWithDistances = lines.reduce((distances, coords) => coords.reduce(distanceReducer, distances), []);
    const findMinIndex = (minIndex, [dist,coord], index, obj) => (obj[minIndex] || Infinity) > dist ? index : minIndex;
    const minIndex = coordinatesWithDistances.reduce(findMinIndex, -1);
    const closest = coordinatesWithDistances[minIndex];
    const nextAfter = coordinatesWithDistances[minIndex + 1];
    if (closest && nextAfter) {
      return { closest: { lat: closest[1][0], lng: closest[1][1] }, bearing: bearing(...[...closest[1], ...nextAfter[1]]) + 90 };
    }
  }

  return false;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { zoom: 15 };
    this.handleClick = this.handleClick.bind(this);
    this.handleReady= this.handleReady.bind(this);
  }

  handleReady({ target: map }) {
    if (process.env.REACT_APP_HTTPS === 'true') {
      map.on('locationfound', (e) => {
        this.setState({ userLocation: e.latlng })
      });
      map.locate({ watch: true });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { userLocation } = prevState;
    const { lines } = nextProps;
    const bearingInfo = calculateBearing(userLocation, lines);

    return { bearingInfo };
  }

  render() {
    const {
      draggingEnabled,
      accessToken,
      setTarget,
      clearTarget,
      undo,
      redo,
      clear,
      path,
      lines,
      routeMetadata,
      target,
      targetMode,
      loading,
      wrapWithTrackEvent,
      browser,
    } = this.props;
    const {
      totalDistanceMiles,
      startStreet,
      endStreet,
      topStreets,
    } = routeMetadata;
    const { isMobileDevice } = browser;
    const { zoom, userLocation, time, bearingInfo } = this.state;

    if (startStreet) {
      const description = `${totalDistanceMiles} mile(s), ${startStreet} - ${endStreet} via ${topStreets.join(' & ')}`;
      global.document.title = description;
    }

    const bounds = determineBounds({ loading, path })
    const additionalProps = bounds ?
      { bounds } : loading ?
      INIITAL_CENTER : {};

    return (
      <div style={{position: 'relative', height: '100%' }}>
        <div style={{position: 'relative', height: '100%' }}>
          <Map
            dragging={draggingEnabled}
            zoomControl={false}
            attributionControl={false}
            style={{height: '100%'}}
            doubleClickZoom={!isMobileDevice}
            onViewportChanged={({ zoom }) => this.setState({ zoom })}
            onClick={this.handleClick}
            whenReady={this.handleReady}
            {...additionalProps}
          >
            <TileLayer
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
              url={`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`}
              id='mapbox.streets'
            />
            <RoutePlotter
              setTarget={setTarget}
              path={path}
              lines={lines}
              zoom={zoom}
            />
            <Pane name='userLocation'>
              {userLocation && (
                <>
                  <AnimatedCircle
                    pane='userLocation'
                    radius={Math.pow(31 - zoom, 5) / 42000 * 3}
                    stroke={false}
                    fillColor='#dcdad6'
                    center={userLocation}
                  />
                  <Circle
                    pane='userLocation'
                    radius={Math.pow(31 - zoom, 5) / 40000 * 1}
                    weight={3}
                    fillColor='#5494ff'
                    fillOpacity={1}
                    color='white'
                    opacity={zoom < 12 ? 0.7 : 0}
                    center={userLocation}
                  />
                  {bearingInfo && (
                    <Marker pane='userLocation' icon={L.divIcon({ className: '', html: TriangleIcon(bearingInfo.bearing)})} position={bearingInfo.closest} />
                  )}
                </>
              )}
            </Pane>
          </Map>
        </div>
        <div style={{ position: 'relative', zIndex: 1000 }}>
          <ControlsPanel>
            {target && targetMode === TARGET_MODES.DOUBLE_CLICK && (
              <Button onClick={wrapWithTrackEvent(clearTarget, { action: 'clearTarget' })}>Clear Selection</Button>
            )}
            <Button onClick={wrapWithTrackEvent(undo, { action: 'undo' })}>Undo</Button>
            <Button onClick={wrapWithTrackEvent(redo, { action: 'redo' })}>Redo</Button>
            <Button onClick={wrapWithTrackEvent(clear, { action: 'clear' })}>Clear</Button>
            <div style={{flex: '1'}}>{totalDistanceMiles} miles</div>
          </ControlsPanel>
        </div>
      </div>
    );
  }

  handleClick({ latlng, ...rest }) {
    const {
      appendPoint,
      movePoint,
      clearTarget,
      targetType,
      targetData,
      getTargetState,
      trackEvent,
    } = this.props;

    console.log(latlng)
    const targetState = getTargetState();

    if (targetState === 'ready') {
      if (targetType === 'polyline') {
        const { startLatlng } = targetData;
        appendPoint({ latlng, after: startLatlng });
        clearTarget();
        trackEvent({ action: 'appendPoint:insert' })
      } else if (targetType === 'waypoint') {
        const { latlng: oldLatlng } = targetData;
        movePoint(oldLatlng, latlng);
        clearTarget();
        trackEvent({ action: 'appendPoint:insert' })
      }
    } else if (targetState === false) {
      appendPoint({ latlng });
      trackEvent({ action: 'appendPoint:push' })
    }
  }
}

export default compose(
  withTrackEvent('map'),
  withDragging,
  withBrowser,
  withLocationHash,
  withRoute,
  withTarget
)(App);
