import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, TextField, Button, Paper, Alert,
    ToggleButtonGroup, ToggleButton, InputAdornment, IconButton,
} from '@mui/material';
import {
    Visibility, VisibilityOff, PersonAdd,
    Work as WorkIcon, Engineering,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('worker');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, phone, password, role);
            navigate('/jobs');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 4, width: '100%', borderRadius: 3,
                        background: 'rgba(26, 25, 41, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(108, 99, 255, 0.15)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={800}>
                            Join ShortJob
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Find or post short-term jobs nearby
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            margin="normal"
                            required
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            margin="normal"
                            required
                            type="tel"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }} color="text.secondary">
                            I am a...
                        </Typography>
                        <ToggleButtonGroup
                            fullWidth
                            value={role}
                            exclusive
                            onChange={(_, val) => val && setRole(val)}
                            sx={{
                                '& .MuiToggleButton-root': {
                                    borderRadius: 2,
                                    py: 1.5,
                                    '&.Mui-selected': {
                                        background: 'rgba(108, 99, 255, 0.2)',
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ToggleButton value="worker">
                                <Engineering sx={{ mr: 1 }} /> Worker
                            </ToggleButton>
                            <ToggleButton value="employer">
                                <WorkIcon sx={{ mr: 1 }} /> Employer
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>

                        <Typography textAlign="center" color="text.secondary">
                            Already have an account?{' '}
                            <RouterLink to="/login" style={{ color: '#6C63FF', textDecoration: 'none' }}>
                                Sign in
                            </RouterLink>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
