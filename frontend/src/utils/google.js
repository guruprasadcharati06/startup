const DEFAULT_STORE_COORDINATES = { lat: 12.9716, lng: 77.5946 };

export const loadGoogleMaps = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.google && window.google.maps) {
      resolve(true);
      return;
    }

    const script = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');

    if (!script) {
      resolve(false);
      return;
    }

    const handleLoad = () => {
      script.dataset.mapsLoaded = 'true';
      resolve(true);
    };

    if (script.dataset.mapsLoaded === 'true') {
      resolve(true);
      return;
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
  });

export const geocodeAddress = (address) =>
  new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps SDK not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const [primary] = results;
        resolve({
          formattedAddress: primary.formatted_address,
          location: {
            lat: primary.geometry.location.lat(),
            lng: primary.geometry.location.lng(),
          },
          addressComponents: primary.address_components,
        });
        return;
      }

      reject(new Error('Unable to verify the provided address with Google Maps.'));
    });
  });

export const extractComponent = (components, type) => {
  if (!Array.isArray(components)) {
    return '';
  }
  const match = components.find((component) => component.types.includes(type));
  return match ? match.long_name : '';
};

export const getStoreCoordinates = () => {
  const script = document.querySelector('script[data-store-lat][data-store-lng]');

  if (!script) {
    return DEFAULT_STORE_COORDINATES;
  }

  const lat = Number(script.getAttribute('data-store-lat'));
  const lng = Number(script.getAttribute('data-store-lng'));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return DEFAULT_STORE_COORDINATES;
  }

  return { lat, lng };
};
