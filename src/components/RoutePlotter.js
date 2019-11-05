import React from 'react';
import slice from 'lodash/slice';
import { Polyline, Pane } from 'react-leaflet';
import L from 'leaflet';

import HoverCircle from './HoverCircle';

const RoutePlotter = (props) => {
  const {
    setTarget,
    path,
    lines,
    zoom,
  } = props;

  return (
    <>
      {lines.map((coords, i) => (
        <>
          <Polyline
            weight='5'
            opacity={0.6}
            positions={coords}
            onMouseDown={(e) => setTarget('polyline', e.target, { startLatlng: path[i] })}
          />
          {zoom > 12 && slice(coords, 1, -1).map((latlng, ii) => ii % 3 === 0 && (
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
    </>
  );
};

export default RoutePlotter;
