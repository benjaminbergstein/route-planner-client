import React from 'react';
import slice from 'lodash/slice';
import { Polyline, Pane } from 'react-leaflet';
import L from 'leaflet';

import HoverCircle from './HoverCircle';

const isSameLatLng = (latlng1, latlng2) => {
  if (!latlng1 || !latlng2) return false;
  const { lat: lat1, lng: lng1 } = latlng1;
  const { lat: lat2, lng: lng2 } = latlng2;
  return lat1 === lat2 && lng1 === lng2;
};

const RoutePlotter = (props) => {
  const {
    setTarget,
    target,
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
          />
          {slice(coords, 1, -1).map(([lat, lng], ii) => ii % 3 === 0 && (
            <HoverCircle
              isActive={isSameLatLng(target, { lat, lng })}
              zoom={zoom}
              profile='SMALL'
              center={{ lat, lng}}
            />
          ))}
        </>
      ))}
      <Pane name='coordinates'>
        {path.map((latlng) => (
          <HoverCircle
            pane='coordinates'
            profile='LARGE'
            isActive={isSameLatLng(target, latlng)}
            center={latlng}
            zoom={zoom}
          />
        ))}
      </Pane>
    </>
  );
};

export default RoutePlotter;
