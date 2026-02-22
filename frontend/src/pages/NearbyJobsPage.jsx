import { useState, useEffect, useCallback } from 'react';
import {
    Container, Grid, Typography, Box, Slider, Alert, CircularProgress,
} from '@mui/material';
import { NearMe } from '@mui/icons-material';
import api from '../api/api';
import MapView from '../components/MapView';
import JobCard from '../components/JobCard';

export default function NearbyJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [position, setPosition] = useState(null);
    const [radius, setRadius] = useState(3);

    const fetchJobs = useCallback(async (lat, lng, r) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/jobs/nearby', {
                params: { lat, lng, radius: r },
            });
            setJobs(response.data.jobs || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const defaultLat = 10.762622;
        const defaultLng = 106.660172;

        const useDefault = () => {
            setPosition([defaultLat, defaultLng]);
            fetchJobs(defaultLat, defaultLng, radius);
        };

        if (!navigator.geolocation) {
            useDefault();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                fetchJobs(latitude, longitude, radius);
            },
            () => useDefault(),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRadiusChange = (_, newValue) => {
        setRadius(newValue);
        if (position) {
            fetchJobs(position[0], position[1], newValue);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <NearMe sx={{ color: 'primary.main' }} />
                    <Typography variant="h4" fontWeight={800}>
                        Jobs Nearby
                    </Typography>
                </Box>
                <Typography color="text.secondary">
                    Showing jobs within {radius}km of your location
                </Typography>
            </Box>

            <Box sx={{ mb: 3, px: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Search radius: {radius}km
                </Typography>
                <Slider
                    value={radius}
                    onChange={handleRadiusChange}
                    min={0.5}
                    max={5}
                    step={0.5}
                    marks={[
                        { value: 0.5, label: '500m' },
                        { value: 3, label: '3km' },
                        { value: 5, label: '5km' },
                    ]}
                    sx={{
                        '& .MuiSlider-track': {
                            background: 'linear-gradient(90deg, #6C63FF, #FF6B9D)',
                        },
                    }}
                />
            </Box>

            <Box sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                <MapView
                    userPosition={position}
                    jobs={jobs}
                    height="350px"
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                        No jobs found nearby
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try increasing the search radius
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {jobs.map((job) => (
                        <Grid item xs={12} sm={6} md={4} key={job.id}>
                            <JobCard job={job} showDistance />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}
