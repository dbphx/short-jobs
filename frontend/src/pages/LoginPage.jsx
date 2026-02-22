import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, TextField, Button, Paper, Alert,
    InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(phone, password);
            navigate('/jobs');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
                        <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={800}>
                            Welcome Back
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Sign in to find jobs nearby
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            margin="normal"
                            required
                            autoFocus
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

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <Typography textAlign="center" color="text.secondary">
                            Don&apos;t have an account?{' '}
                            <RouterLink to="/register" style={{ color: '#6C63FF', textDecoration: 'none' }}>
                                Sign up
                            </RouterLink>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
