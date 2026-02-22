import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    Avatar,
    Chip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Work as WorkIcon,
    AddCircle as AddIcon,
    Star as StarIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    NearMe as NearMeIcon,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { user, isAuthenticated, isEmployer, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { text: 'Nearby Jobs', icon: <NearMeIcon />, path: '/jobs', show: true },
        { text: 'Post a Job', icon: <AddIcon />, path: '/post-job', show: isAuthenticated && isEmployer },
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', show: isAuthenticated },
    ];

    const drawerContent = (
        <Box sx={{ width: 280, pt: 2 }}>
            {isAuthenticated && user && (
                <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                    <Avatar
                        sx={{
                            width: 56, height: 56, mx: 'auto', mb: 1,
                            background: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
                        }}
                    >
                        {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={600}>{user.name}</Typography>
                    <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'employer' ? 'primary' : 'secondary'}
                        sx={{ mt: 0.5 }}
                    />
                    {user.rating_avg > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 0.5 }}>
                            <StarIcon sx={{ fontSize: 16, color: '#FFB84D' }} />
                            <Typography variant="body2" color="text.secondary">
                                {user.rating_avg.toFixed(1)} ({user.rating_count})
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
            <List>
                {navItems.filter(item => item.show).map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                            selected={location.pathname === item.path}
                            sx={{
                                mx: 1, borderRadius: 2,
                                '&.Mui-selected': {
                                    background: 'rgba(108, 99, 255, 0.15)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
            <AppBar position="sticky" elevation={0}>
                <Toolbar>
                    {isMobile && (
                        <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #6C63FF, #FF6B9D)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        ShortJob
                    </Typography>

                    {!isMobile && navItems.filter(item => item.show).map((item) => (
                        <Button
                            key={item.text}
                            component={RouterLink}
                            to={item.path}
                            startIcon={item.icon}
                            sx={{
                                mx: 0.5,
                                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                            }}
                        >
                            {item.text}
                        </Button>
                    ))}

                    {isAuthenticated ? (
                        <Button
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            color="inherit"
                            sx={{ ml: 1 }}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button
                            component={RouterLink}
                            to="/login"
                            startIcon={<LoginIcon />}
                            variant="contained"
                            sx={{ ml: 1 }}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        background: theme.palette.background.paper,
                        borderRight: '1px solid rgba(108, 99, 255, 0.1)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box component="main" sx={{ pb: 4 }}>
                {children}
            </Box>
        </Box>
    );
}
