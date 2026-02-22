import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Paper, Typography, Box, TextField, Button, Alert,
} from '@mui/material';
import { AddCircle, MyLocation } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/api';

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position ? <Marker position={position} /> : null;
}

export default function PostJobPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        hourly_rate: '',
        total_payment: '',
    });
    const [position, setPosition] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
                () => setPosition([10.762622, 106.660172])
            );
        }
    }, []);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            setError('Please click on the map to set the job location');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/jobs', {
                ...formData,
                hourly_rate: parseFloat(formData.hourly_rate),
                total_payment: parseFloat(formData.total_payment) || 0,
                latitude: position[0],
                longitude: position[1],
            });
            navigate(`/jobs/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    const mapCenter = position || [10.762622, 106.660172];

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AddCircle sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" fontWeight={800}>Post a Job</Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 4, borderRadius: 3,
                    background: 'rgba(26, 25, 41, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(108, 99, 255, 0.1)',
                }}
            >
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Job Title"
                        value={formData.title}
                        onChange={handleChange('title')}
                        required
                        margin="normal"
                        placeholder="e.g. Help moving furniture"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={handleChange('description')}
                        multiline
                        rows={4}
                        margin="normal"
                        placeholder="Describe what needs to be done..."
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Hourly Rate (VND)"
                            value={formData.hourly_rate}
                            onChange={handleChange('hourly_rate')}
                            required
                            type="number"
                            margin="normal"
                            placeholder="50000"
                        />
                        <TextField
                            fullWidth
                            label="Total Payment (VND, optional)"
                            value={formData.total_payment}
                            onChange={handleChange('total_payment')}
                            type="number"
                            margin="normal"
                            placeholder="200000"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            📍 Job Location (click on map)
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<MyLocation />}
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
                                        (err) => setError('Could not get current location: ' + err.message)
                                    );
                                } else {
                                    setError('Geolocation is not supported by your browser');
                                }
                            }}
                        >
                            Use My Location
                        </Button>
                    </Box>
                    <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={14}
                            style={{ height: '300px', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <LocationPicker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </Box>

                    {position && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Location: {position[0].toFixed(4)}, {position[1].toFixed(4)}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? 'Creating Job...' : 'Create Job'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
