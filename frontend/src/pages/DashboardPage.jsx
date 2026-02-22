import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Tabs, Tab, CircularProgress, Alert, Stack,
} from '@mui/material';
import { Dashboard, History, PlayArrow } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import JobCard from '../components/JobCard';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const endpoint = user.role === 'employer' ? '/jobs/my' : '/jobs/assignments';
            const response = await api.get(endpoint);
            setJobs(response.data.jobs || []);
        } catch (err) {
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'assigned');
    const historyJobs = jobs.filter(j => j.status === 'done' || j.status === 'cancelled');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Dashboard sx={{ color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab
                        icon={<PlayArrow sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="Active Tasks"
                    />
                    <Tab
                        icon={<History sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                        label="History"
                    />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                {activeJobs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary">
                            {user.role === 'employer' ? 'No active jobs posted' : 'No active assignments'}
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {activeJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </Stack>
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {historyJobs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="h6" color="text.secondary">No history found</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {historyJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </Stack>
                )}
            </TabPanel>
        </Container>
    );
}
