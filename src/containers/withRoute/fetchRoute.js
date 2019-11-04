const PROTOCOL = process.env.REACT_APP_HTTPS === 'true' ? 'https' : 'http';
const ROUTING_HOST = process.env.REACT_APP_ROUTING_HOST;
const ROUTING_URL = `${PROTOCOL}://${ROUTING_HOST}/ors/v2/directions`;
const routeCache = {};
const fetchRoute = ([ start, end ]) => {
  if (routeCache[[start, end]]) return Promise.resolve(routeCache[[start, end]]);

  return fetch(`${ROUTING_URL}/foot-walking?start=${start}&end=${end}`)
    .then((res) => res.json())
    .then((res) => {
      routeCache[[ start, end ]] = res;
      return res;
    });
}

export default fetchRoute;
