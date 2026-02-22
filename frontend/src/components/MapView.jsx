import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const jobIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function MapView({ userPosition, jobs = [], onJobClick, height = '400px' }) {
    const center = userPosition || [10.762622, 106.660172]; // Default: Ho Chi Minh City

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height, width: '100%', borderRadius: 12, zIndex: 0 }}
        >
            <ChangeView center={center} />
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {userPosition && (
                <Marker position={userPosition} icon={userIcon}>
                    <Popup>📍 Your location</Popup>
                </Marker>
            )}

            {jobs.map((job) => (
                <Marker
                    key={job.id}
                    position={[job.latitude, job.longitude]}
                    icon={jobIcon}
                    eventHandlers={{
                        click: () => onJobClick?.(job),
                    }}
                >
                    <Popup>
                        <strong>{job.title}</strong>
                        <br />
                        {job.hourly_rate?.toLocaleString()}đ/giờ
                        {job.distance !== undefined && (
                            <>
                                <br />
                                {job.distance < 1
                                    ? `${(job.distance * 1000).toFixed(0)}m`
                                    : `${job.distance.toFixed(1)}km`
                                }
                            </>
                        )}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
