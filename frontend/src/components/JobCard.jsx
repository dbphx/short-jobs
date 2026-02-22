import {
    Card, CardContent, CardActions, Typography, Chip, Box, Button, Stack,
} from '@mui/material';
import {
    LocationOn, AccessTime, AttachMoney, Star, Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const statusColors = {
    open: 'success',
    assigned: 'warning',
    done: 'info',
    cancelled: 'error',
};

export default function JobCard({ job, showDistance = false }) {
    const navigate = useNavigate();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                        {job.title}
                    </Typography>
                    <Chip
                        label={job.status}
                        size="small"
                        color={statusColors[job.status] || 'default'}
                        sx={{ ml: 1 }}
                    />
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {job.description}
                </Typography>

                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography variant="body2" fontWeight={600} color="success.main">
                            {job.hourly_rate?.toLocaleString()}đ/giờ
                        </Typography>
                        {job.total_payment > 0 && (
                            <Typography variant="body2" color="text.secondary">
                                · Tổng: {job.total_payment?.toLocaleString()}đ
                            </Typography>
                        )}
                    </Box>

                    {showDistance && job.distance !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2" color="primary.main" fontWeight={500}>
                                {job.distance < 1
                                    ? `${(job.distance * 1000).toFixed(0)}m away`
                                    : `${job.distance.toFixed(1)}km away`
                                }
                            </Typography>
                        </Box>
                    )}

                    {job.employer && !job.assigned_worker && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star sx={{ fontSize: 18, color: '#FFB84D' }} />
                            <Typography variant="body2" color="text.secondary">
                                {job.employer.name}
                                {job.employer.rating_avg > 0 && ` · ${job.employer.rating_avg.toFixed(1)}★`}
                            </Typography>
                        </Box>
                    )}

                    {job.assigned_worker && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                                Worker: <strong>{job.assigned_worker.name}</strong>
                                {job.assigned_worker.rating_avg > 0 && ` · ${job.assigned_worker.rating_avg.toFixed(1)}★`}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {new Date(job.created_at).toLocaleDateString('vi-VN')}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                >
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
}
