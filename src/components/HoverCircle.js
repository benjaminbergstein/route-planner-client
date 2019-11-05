import React, { useState } from 'react';
import { Circle } from 'react-leaflet';

const BLUE = '#5494ff';

const PROFILES = {
  SMALL: { radius: 1.5 },
  LARGE: { radius: 2 },
};

const ActiveCircle = ({ zoom, profile, ...props }) => {
  const [active, setActive] = useState(false);
  const { radius } = PROFILES[profile];;
  const zoomFactor = Math.pow(31 - zoom, 4) / 6000;

  return (
    <Circle
      radius={(active ? radius * 1.5 : radius) * zoomFactor}
      onMouseOver={() => setActive(true)}
      onMouseOut={() => setActive(false)}
      fillColor={active ? 'white' : BLUE}
      fillOpacity={1}
      color='#6880a7'
      weight={active ? 5 : 1}
      opacity={active ? 0.7 : 1}
      {...props}
    />
  )
};

export default ActiveCircle;
