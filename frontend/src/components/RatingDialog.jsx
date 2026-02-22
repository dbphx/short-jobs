import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Rating as MuiRating, TextField, Button, Box, Typography,
} from '@mui/material';
import { Star } from '@mui/icons-material';
import api from '../api/api';

export default function RatingDialog({ open, onClose, jobId, toUserId, toUserName }) {
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (score === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/ratings', {
                job_id: jobId,
                to_user_id: toUserId,
                score,
                comment,
            });
            onClose(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
                Rate {toUserName}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 2 }}>
                    <MuiRating
                        value={score}
                        onChange={(_, newValue) => setScore(newValue)}
                        size="large"
                        icon={<Star fontSize="inherit" sx={{ color: '#FFB84D' }} />}
                        emptyIcon={<Star fontSize="inherit" />}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {score === 0 ? 'Tap to rate' : `${score} star${score > 1 ? 's' : ''}`}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Write a comment (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    {error && (
                        <Typography color="error" variant="body2">{error}</Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => onClose(false)} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Rating'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
