import React, { useState } from 'react';
import { Circle } from 'react-leaflet';

const BLUE = '#5494ff';

const PROFILES = {
  SMALL: {
    radius: 1.5,
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
      fillColor={hover ? 'white' : BLUE}
      fillOpacity={1}
      color='gray'
      weight={hover ? 5 : 1}
      opacity={1}
      {...props}
    />
  )
};

export default HoverCircle;
