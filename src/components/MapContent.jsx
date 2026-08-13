'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapContent({ properties = [], center = [20.5937, 78.9629], zoom = 5, height = '400px', singleMarker = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstance.current) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) layer.remove();
    });

    const markers = [];

    if (singleMarker && singleMarker.lat && singleMarker.lng) {
      const marker = L.marker([singleMarker.lat, singleMarker.lng]).addTo(map);
      if (singleMarker.title) {
        marker.bindPopup(`<strong>${singleMarker.title}</strong><br/>₹${singleMarker.price?.toLocaleString() || ''}`);
      }
      map.setView([singleMarker.lat, singleMarker.lng], 15);
      markers.push(marker);
    }

    const validProperties = properties.filter(p => p.location?.coordinates?.lat && p.location?.coordinates?.lng);
    if (validProperties.length > 0) {
      const bounds = [];
      validProperties.forEach((property) => {
        const lat = property.location.coordinates.lat;
        const lng = property.location.coordinates.lng;
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
          <div style="text-align:center;font-family:sans-serif;">
            <strong style="font-size:14px;">${property.title}</strong><br/>
            <span style="color:#4f46e5;font-weight:bold;">₹${property.price?.toLocaleString()}</span><br/>
            <a href="/properties/${property._id}" style="color:#4f46e5;font-size:12px;font-weight:bold;">View Details →</a>
          </div>
        `);
        bounds.push([lat, lng]);
        markers.push(marker);
      });
      if (!singleMarker && bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [properties, singleMarker]);

  return <div ref={mapRef} style={{ height, width: '100%', borderRadius: '24px', zIndex: 0 }} />;
}
