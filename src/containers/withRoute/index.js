import React from 'react';
import get from 'lodash/get';
import slice from 'lodash/slice';
import first from 'lodash/first';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

import buildPath from './buildPath.js';

const MILES_PER_METER = 0.0006213712;

const INITIAL_STATE = {
  loading: true,
  lines: [],
  routeMetadata: {
    totalDistance: 0
  }
};

const serializePath = (path) => compressToEncodedURIComponent(JSON.stringify(path));
const deserializePath = (serialized) => JSON.parse(decompressFromEncodedURIComponent(serialized));

const sameLatlng = (
  { lat: lat1, lng: lng1 },
  { lat: lat2, lng: lng2 }
) => lat1 === lat2 && lng1 === lng2;

const getRouteMetadata = ({ streets }) => {
  const streetTotals = slice(streets, 1, -1).reduce((memo, [street, dist]) => {
    return {
      ...memo,
      [street]: memo[street] ? memo[street] + dist : dist,
    }
  }, {});
  const [startStreet] = first(streets);
  const [endStreet] = last(streets);
  const topStreets = slice(sortBy(
      Object.entries(streetTotals),
      [([street, total]) => total]
    ), -2)
    .map(([street]) => street)
    .reverse();

  return {
    startStreet,
    endStreet,
    topStreets,
  };
};

const withRoute = (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props);
      const { locationHash } = this.props;

      const path = locationHash && locationHash !== '' ? deserializePath(locationHash) : [];
      this.state = {
        ...INITIAL_STATE,
        path,
      };
      this.appendPoint = this.appendPoint.bind(this);
      this.movePoint = this.movePoint.bind(this);
      this.undo = this.undo.bind(this);
      this.redo = this.redo.bind(this);
      this.clear = this.clear.bind(this);
    }

    componentDidMount() {
      const { path, loading } = this.state;
      if (loading && path.length > 1) {
        this.updatePath(path);
      }
    }

    updatePath(newPath, setPrevPath) {
      const { path, loading } = this.state;
      const promise = buildPath(newPath);
      promise.then((paths) => {
        const [lines, totalDistance, streets] = paths.reduce(([lines, totalDistance, streets], p) => {
          const distance = get(p, 'features[0].properties.summary.distance');
          const additionalStreets = get(p, 'features[0].properties.segments[0].steps')
            .reduce((memo, { name, duration }) => name === '-' ? memo : [...memo, [name, duration]], []);
          const line = get(p, 'features[0].geometry.coordinates').map(([lat, lng]) => [lng, lat])
          return [[...lines, line], totalDistance + distance, [...streets, ...additionalStreets]]
        }, [[], 0, []]);

        const totalDistanceMiles = Math.floor(totalDistance * MILES_PER_METER * 100.0) / 100.0
        const routeMetadata = streets.length > 1 ?  getRouteMetadata({ streets }) : {};

        this.setState({
          lines,
          routeMetadata: {
            ...routeMetadata,
            totalDistance,
            totalDistanceMiles,
          },
        });
      });
      if (setPrevPath !== false) newPath.prevPath = path;
      global.location.hash = newPath.length > 1 ? serializePath(newPath) : '';

      this.setState({ path: newPath, loading: false });
    }

    redo() {
      const { path } = this.state;
      const { nextPath } = path;
      if (nextPath) {
        nextPath.prevPath = path;
        this.updatePath(nextPath, false);
      }
    }

    undo() {
      const { path } = this.state;
      const { prevPath } = path;
      if (prevPath) {
        prevPath.nextPath = path;
        this.updatePath(prevPath, false);
      }
    }

    movePoint(oldLatlng, newLatlng) {
      const { path } = this.state;
      const index = path.indexOf(oldLatlng);
      const newPath = [
        ...slice(path, 0, index),
        newLatlng,
        ...slice(path, index + 1),
      ];
      this.updatePath(newPath);
    }

    clear() {
      this.updatePath([]);
    }

    appendPoint({ latlng, after }) {
      const { path } = this.state;
      this.updatePath(
        after ?
        path.reduce((memo, ll) => {
          return sameLatlng(ll, after) ?
            [...memo, ll, latlng] : [...memo, ll];
        }, []) : [...path, latlng]
      )
    }

    render() {
      return <Component
        path={this.state.path}
        lines={this.state.lines}
        routeMetadata={this.state.routeMetadata}
        appendPoint={this.appendPoint}
        movePoint={this.movePoint}
        undo={this.undo}
        redo={this.redo}
        clear={this.clear}
        loading={this.state.loading}
        {...this.props}
      />
    }
  };

export default withRoute;
