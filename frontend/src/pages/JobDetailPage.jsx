import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Paper, Typography, Box, Button, Chip, Divider,
    Alert, CircularProgress, Stack,
} from '@mui/material';
import {
    LocationOn, AccessTime, AttachMoney, Star, Person,
    CheckCircle, ArrowBack,
} from '@mui/icons-material';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import RatingDialog from '../components/RatingDialog';
import MapView from '../components/MapView';

const statusColors = {
    open: 'success', assigned: 'warning', done: 'info', cancelled: 'error',
};

export default function JobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isWorker, isEmployer } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [ratingOpen, setRatingOpen] = useState(false);
    const [ratingTarget, setRatingTarget] = useState(null);

    useEffect(() => {
        fetchJob();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchJob = async () => {
        try {
            const response = await api.get(`/jobs/${id}`);
            setJob(response.data);
        } catch (err) {
            setError('Job not found');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        setActionLoading(true);
        setError('');
        try {
            await api.post(`/jobs/${id}/apply`);
            setSuccess('Application submitted successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to apply');
        } finally {
            setActionLoading(false);
        }
    };

    const handleComplete = async () => {
        setActionLoading(true);
        setError('');
        try {
            await api.put(`/jobs/${id}/complete`);
            setSuccess('Job marked as complete!');
            fetchJob();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to complete job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenRating = (toUserId, toUserName) => {
        setRatingTarget({ id: toUserId, name: toUserName });
        setRatingOpen(true);
    };

    const handleRatingClose = (submitted) => {
        setRatingOpen(false);
        if (submitted) {
            setSuccess('Rating submitted successfully!');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!job) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">Job not found</Alert>
            </Container>
        );
    }

    const isOwner = user && job.employer_id === user.id;
    const isAssignedWorker = user && job.assigned_worker_id === user.id;

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
                color="inherit"
            >
                Back
            </Button>

            <Paper
                elevation={0}
                sx={{
                    p: 4, borderRadius: 3,
                    background: 'rgba(26, 25, 41, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(108, 99, 255, 0.1)',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h4" fontWeight={800}>
                        {job.title}
                    </Typography>
                    <Chip
                        label={job.status}
                        color={statusColors[job.status]}
                        sx={{ fontWeight: 600 }}
                    />
                </Box>

                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ color: 'success.main' }} />
                        <Typography variant="h6" color="success.main" fontWeight={700}>
                            {job.hourly_rate?.toLocaleString()}đ/giờ
                        </Typography>
                        {job.total_payment > 0 && (
                            <Typography color="text.secondary">
                                · Total: {job.total_payment?.toLocaleString()}đ
                            </Typography>
                        )}
                    </Box>

                    {job.employer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ color: 'text.secondary' }} />
                            <Typography color="text.secondary">
                                Posted by <strong>{job.employer.name}</strong>
                                {job.employer.rating_avg > 0 && (
                                    <> · <Star sx={{ fontSize: 14, verticalAlign: 'middle', color: '#FFB84D' }} /> {job.employer.rating_avg.toFixed(1)}</>
                                )}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ color: 'text.secondary' }} />
                        <Typography color="text.secondary">
                            Posted {new Date(job.created_at).toLocaleDateString('vi-VN')}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ color: 'primary.main' }} />
                        <Typography color="text.secondary">
                            {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}
                        </Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2, borderColor: 'rgba(108, 99, 255, 0.1)' }} />

                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Description</Typography>
                <Typography color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                    {job.description || 'No description provided.'}
                </Typography>

                <Box sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                    <MapView
                        jobs={[job]}
                        height="250px"
                    />
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Stack direction="row" spacing={2}>
                    {isWorker && job.status === 'open' && (
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleApply}
                            disabled={actionLoading}
                            startIcon={<CheckCircle />}
                            fullWidth
                        >
                            {actionLoading ? 'Applying...' : 'Apply for this Job'}
                        </Button>
                    )}

                    {isOwner && job.status === 'assigned' && (
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={handleComplete}
                            disabled={actionLoading}
                            startIcon={<CheckCircle />}
                            fullWidth
                        >
                            {actionLoading ? 'Completing...' : 'Mark as Complete'}
                        </Button>
                    )}

                    {job.status === 'done' && isOwner && job.assigned_worker_id && (
                        <Button
                            variant={job.employer_rated ? "text" : "outlined"}
                            size="large"
                            onClick={() => !job.employer_rated && handleOpenRating(job.assigned_worker_id, 'Worker')}
                            startIcon={job.employer_rated ? <CheckCircle /> : <Star />}
                            fullWidth
                            disabled={job.employer_rated}
                        >
                            {job.employer_rated ? 'Worker Rated' : 'Rate Worker'}
                        </Button>
                    )}

                    {job.status === 'done' && isAssignedWorker && (
                        <Button
                            variant={job.worker_rated ? "text" : "outlined"}
                            size="large"
                            onClick={() => !job.worker_rated && handleOpenRating(job.employer_id, job.employer?.name)}
                            startIcon={job.worker_rated ? <CheckCircle /> : <Star />}
                            fullWidth
                            disabled={job.worker_rated}
                        >
                            {job.worker_rated ? 'Employer Rated' : 'Rate Employer'}
                        </Button>
                    )}
                </Stack>
            </Paper>

            {ratingTarget && (
                <RatingDialog
                    open={ratingOpen}
                    onClose={handleRatingClose}
                    jobId={id}
                    toUserId={ratingTarget.id}
                    toUserName={ratingTarget.name}
                />
            )}
        </Container>
    );
}
