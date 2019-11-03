import React, { useState } from 'react';
import { Circle } from 'react-leaflet';

const PROFILES = {
  SMALL: {
    radius: 1,
    baseOpacity: 0.8,
  },
  LARGE: {
    radius: 2,
    baseOpacity: 0.8,
  },
}
const HoverCircle = ({ zoom, profile, ...props }) => {
  const [hover, setHover] = useState(false);
  const { radius, baseOpacity } = PROFILES[profile];;
  const zoomFactor = Math.pow(31 - zoom, 4) / 6000;

  return (
    <Circle
      radius={(hover ? radius * 1.5 : radius) * zoomFactor}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      fillColor={hover ? 'white' : '#4285f4'}
      fillOpacity={(hover ? 1 : 0.8) * baseOpacity}
      color='gray'
      weight={hover ? 5 : 1}
      opacity={(hover ? 0.8 : 0.8) * baseOpacity}
      {...props}
    />
  )
};

export default HoverCircle;
