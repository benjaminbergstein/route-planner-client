import React, { useState } from 'react';
import compose from 'recompose/compose';
import slice from 'lodash/slice';
import {
  Map,
  Pane,
  LayerGroup,
  TileLayer,
  Circle,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';

import './App.css';
import withRoute from '../../containers/withRoute/index';
import withTarget, { TARGET_MODES } from '../../containers/withTarget';
import withLocationHash from '../../containers/withLocationHash';
import withBrowser from '../../containers/withBrowser';
import withTrackEvent from '../../containers/withTrackEvent';
import { ControlsPanel, Button } from '../Controls';
import HoverCircle from '../HoverCircle';

const determineBounds = ({ loading, path }) => {
  if (loading && path.length > 0) {
    const group = new L.featureGroup(path.map((p) => L.marker(p)));
    return group.getBounds();
  }

  return undefined;
}

const FEET_PER_MILES = 5280.0;
const MILES_PER_METER = 0.0006213712;
const INIITAL_CENTER = {
  center: [37.773033, -122.438811],
  zoom: "15"
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { zoom: 15 };
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    const {
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
      targetType,
      targetMode,
      loading,
      wrapWithTrackEvent,
    } = this.props;
    const {
      totalDistanceMiles,
      startStreet,
      endStreet,
      topStreets,
    } = routeMetadata;
    const { zoom } = this.state;

    if (startStreet) {
      const description = `${totalDistanceMiles} mile(s), ${startStreet} - ${endStreet} via ${topStreets.join(' & ')}`;
      global.document.title = description;
    }

    const bounds = determineBounds({ loading, path })
    const additionalProps = bounds ?
      { bounds } : loading ?
      INIITAL_CENTER : {};

    return (
      <div style={{position: 'relative', height: '100%'}}>
        <Map
          dragging={target === undefined || targetMode === TARGET_MODES.DOUBLE_CLICK}
          style={{height: '100%'}}
          onViewportChanged={({ zoom }) => this.setState({ zoom })}
          onClick={this.handleClick}
          {...additionalProps}
        >
          <TileLayer
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            url={`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`}
            id='mapbox.streets'
          />
          {lines.map((coords, i) => (
            <>
              <Polyline
                weight='5'
                opacity={0.6}
                positions={coords}
                onMouseDown={(e) => setTarget('polyline', e.target, { startLatlng: path[i] })}
              />
              {slice(coords, 1, -1).map((latlng, ii) => ii % 3 === 0 && (
                <HoverCircle
                  zoom={zoom}
                  profile='SMALL'
                  center={latlng}
                  onMouseDown={(e) => setTarget('polyline', e.target, { startLatlng: path[i] })}
                />
              ))}
            </>
          ))}
          <Pane name='coordinates'>
            {path.map((latlng) => (
              <HoverCircle
                pane='coordinates'
                profile='LARGE'
                center={latlng}
                zoom={zoom}
                onMouseDown={(e) => setTarget('waypoint', e.target, { latlng })}
              />
            ))}
          </Pane>
        </Map>
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
    );
  }

  handleClick({ latlng, ...rest }) {
    const {
      appendPoint,
      movePoint,
      clearTarget,
      target,
      targetType,
      targetData,
      getTargetState,
      trackEvent,
    } = this.props;

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
  withBrowser,
  withLocationHash,
  withRoute,
  withTarget
)(App);
