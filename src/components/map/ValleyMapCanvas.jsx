'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = (name, active) =>
  L.divIcon({
    className: 'ah-pin',
    html: `<span class="ah-pin__dot${active ? ' is-active' : ''}"></span><span class="ah-pin__label">${name}</span>`,
    iconSize: [0, 0],
  });

function FlyTo({ place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 13), { duration: 0.8 });
  }, [place, map]);
  return null;
}

// Low-level Leaflet canvas — loaded only on the client (needs `window`).
export default function ValleyMapCanvas({ places = [], selected, onSelect = () => {} }) {
  const sel = places.find((p) => p.slug === selected);
  return (
    <MapContainer
      bounds={[[31.985, 77.24], [32.075, 77.53]]}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        attribution="Map data © OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)"
        maxZoom={17}
      />
      {places.map((d) => (
        <Marker
          key={d.slug}
          position={[d.lat, d.lng]}
          icon={pinIcon(d.name, d.slug === selected)}
          eventHandlers={{ click: () => onSelect(d.slug) }}
        />
      ))}
      <FlyTo place={sel} />
    </MapContainer>
  );
}
