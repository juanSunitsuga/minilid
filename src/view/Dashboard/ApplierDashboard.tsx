import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    HourglassEmpty as PendingIcon,
    AccessTime as InterviewIcon,
    BusinessCenter as JobIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { FetchEndpoint } from '../FetchEndpoint';
import { Link } from 'react-router-dom';


// Updated Application interface
interface Application {
    id: number;
    job_id: string;
    applier_id: string;
    status: string;
    createdAt: string;
    updated_at: string;
    jobPost?: {
        job_id: string;
        title: string;
        description: string;
        posted_date: string;
        company?: {
            company_id: string | null;
            company_name: string;
            address: string;
        };
    };
}

const ApplierDashboard: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fix the fetchApplications function with the correct endpoint
    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');

            const response = await FetchEndpoint('/job-applications/my-applications', 'GET', token, null);
            if (!response.ok) {
                throw new Error('Failed to fetch applications');
            }

            const data = await response.json();
            setApplications(data.data || []);
        } catch (err: any) {
            console.error('Error fetching applications:', err);
            setError(err.message || 'An error occurred while fetching your applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Also fix the cancel application endpoint
    const handleCancelApplication = async (applicationId: number) => {
        if (!window.confirm('Are you sure you want to cancel this application?')) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            // Update this endpoint too
            const response = await FetchEndpoint(`/job-applications/delete/${applicationId}`, 'DELETE', token, null);

            if (!response.ok) {
                throw new Error('Failed to cancel application');
            }

            // Refresh the list
            fetchApplications();
        } catch (err: any) {
            console.error('Error canceling application:', err);
            alert(err.message || 'An error occurred while canceling your application');
        }
    };

    const getStatusChip = (status: string) => {
        switch (status.toLowerCase()) {
            case 'applied':
                return <Chip
                    icon={<PendingIcon />}
                    label="Applied"
                    color="primary"
                    variant="outlined"
                />;
            case 'interviewing':
                return <Chip
                    icon={<InterviewIcon />}
                    label="Interviewing"
                    color="info"
                    sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)' }}
                />;
            case 'accepted':
                return <Chip
                    icon={<CheckCircleIcon />}
                    label="Accepted"
                    color="success"
                    sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                />;
            case 'rejected':
                return <Chip
                    icon={<CancelIcon />}
                    label="Rejected"
                    color="error"
                    sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)' }}
                />;
            default:
                return <Chip
                    label={status}
                    variant="outlined"
                />;
        }
    };

    // Calculate statistics
    const stats = {
        total: applications.length,
        applied: applications.filter(app => app.status.toLowerCase() === 'applied').length,
        interviewing: applications.filter(app => app.status.toLowerCase() === 'interviewing').length,
        accepted: applications.filter(app => app.status.toLowerCase() === 'accepted').length,
        rejected: applications.filter(app => app.status.toLowerCase() === 'rejected').length
    };


    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    My Job Applications
                </Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchApplications}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Stats Cards - Using Box with flexbox instead of Grid */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    mb: 4
                }}
            >
                {/* Total Applications */}
                <Box sx={{
                    flexGrow: 1,
                    flexBasis: { xs: '100%', sm: '45%', md: '18%' },
                    minWidth: { xs: '100%', sm: '200px', md: '150px' }
                }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Applications
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Applied */}
                <Box sx={{
                    flexGrow: 1,
                    flexBasis: { xs: '100%', sm: '45%', md: '18%' },
                    minWidth: { xs: '100%', sm: '200px', md: '150px' }
                }}>
                    <Card sx={{ height: '100%', bgcolor: 'primary.light' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="primary.contrastText">
                                {stats.applied}
                            </Typography>
                            <Typography variant="body2" color="primary.contrastText">
                                Applied
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Interviewing */}
                <Box sx={{
                    flexGrow: 1,
                    flexBasis: { xs: '100%', sm: '45%', md: '18%' },
                    minWidth: { xs: '100%', sm: '200px', md: '150px' }
                }}>
                    <Card sx={{ height: '100%', bgcolor: 'info.light' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="info.contrastText">
                                {stats.interviewing}
                            </Typography>
                            <Typography variant="body2" color="info.contrastText">
                                Interviewing
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Accepted */}
                <Box sx={{
                    flexGrow: 1,
                    flexBasis: { xs: '100%', sm: '45%', md: '18%' },
                    minWidth: { xs: '100%', sm: '200px', md: '150px' }
                }}>
                    <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="success.contrastText">
                                {stats.accepted}
                            </Typography>
                            <Typography variant="body2" color="success.contrastText">
                                Accepted
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Rejected */}
                <Box sx={{
                    flexGrow: 1,
                    flexBasis: { xs: '100%', sm: '45%', md: '18%' },
                    minWidth: { xs: '100%', sm: '200px', md: '150px' }
                }}>
                    <Card sx={{ height: '100%', bgcolor: 'error.light' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold" color="error.contrastText">
                                {stats.rejected}
                            </Typography>
                            <Typography variant="body2" color="error.contrastText">
                                Rejected
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ overflowX: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error" align="center" sx={{ p: 3 }}>
                            {error}
                        </Typography>
                    ) : applications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h6" gutterBottom>No applications found</Typography>
                            <Typography variant="body2" color="text.secondary">
                                You haven't applied to any jobs yet
                            </Typography>
                            <Button
                                component={Link}
                                to="/jobs"
                                variant="contained"
                                sx={{ mt: 2 }}
                                startIcon={<JobIcon />}
                            >
                                Browse Jobs
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Job Title</strong></TableCell>
                                        <TableCell><strong>Company</strong></TableCell>
                                        <TableCell><strong>Applied Date</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {applications.map((application) => (
                                        < TableRow key = { application.id } hover >
                                            <TableCell>
                                                <Typography variant="body1">{application.jobPost?.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {application.jobPost?.company?.company_name || "Unknown Company"}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(application.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusChip(application.status)}
                                            </TableCell>
                                            <TableCell>
                                                {application.status.toLowerCase() === 'applied' && (
                                                    <Tooltip title="Cancel Application">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleCancelApplication(application.id)}
                                                        >
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="View Job Details">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        component={Link}
                                                        to={`/job/${application.job_id}`}
                                                    >
                                                        <JobIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                        </TableContainer>
                    )}
            </Box>
        </Paper>
        </Container >
    );
};

export default ApplierDashboard;