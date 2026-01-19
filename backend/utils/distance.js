const DEGREE_TO_RADIAN = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;
const DELIVERY_RATE_PER_KM = 10;

const DEFAULT_STORE_COORDINATES = {
  lat: 12.9716, // Bengaluru default – update to your fulfilment center
  lng: 77.5946,
};

const toNumber = (value) => (typeof value === 'string' ? Number(value) : value);

export const getStoreCoordinates = () => {
  const lat = toNumber(process.env.STORE_LOCATION_LAT ?? DEFAULT_STORE_COORDINATES.lat);
  const lng = toNumber(process.env.STORE_LOCATION_LNG ?? DEFAULT_STORE_COORDINATES.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error('Store coordinates are not configured correctly.');
  }

  return { lat, lng };
};

export const calculateDistanceKm = ({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }) => {
  if ([fromLat, fromLng, toLat, toLng].some((value) => Number.isNaN(Number(value)))) {
    throw new Error('Invalid coordinates provided for distance calculation.');
  }

  const startLat = Number(fromLat) * DEGREE_TO_RADIAN;
  const startLng = Number(fromLng) * DEGREE_TO_RADIAN;
  const endLat = Number(toLat) * DEGREE_TO_RADIAN;
  const endLng = Number(toLng) * DEGREE_TO_RADIAN;

  const deltaLat = endLat - startLat;
  const deltaLng = endLng - startLng;

  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(3));
};

export const calculateDeliveryFee = (distanceKm) =>
  Math.max(0, Number((Number(distanceKm) * DELIVERY_RATE_PER_KM).toFixed(2)));
