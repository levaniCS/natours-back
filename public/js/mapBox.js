export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibGV2YW5pMzEwNSIsImEiOiJja2UydzV2YTYwZGNsMnJtczh5MTE1dGhpIn0.hamuP0RtJRh38BZGzINJ8Q';

  var map = new mapboxgl.Map({
    // id = map
    container: 'map',
    style: 'mapbox://styles/levani3105/cke2wgn1p1bno19qojylf2922',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 10,
    // თუ გვინდა სურათი მხოლოდ
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add Marker
    new mapboxgl.Marker({
      element: el,
      //bottom of the pin
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include curr location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
