import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Grid,
    Container,
    Typography,
    TablePagination,
    Alert,
    Snackbar
} from '@mui/material';
import Sidebar from '../Admin Dashboard/Sidebar'; // Adjust the import path as needed
import axios from 'axios';
import { BASE_URL } from '../utils/config';

const HolidayPackagePanel = () => {
    const [packages, setPackages] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState({
        _id: '',
        title: '',
        city: '',
        address: '',
        distance: '',
        photo: '',
        desc: '',
        price: '',
        maxGroupSize: '',
        featured: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch packages with pagination
    const fetchPackages = useCallback( async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/Tour/ViewAll`, {
                params: {
                    page,
                    limit: rowsPerPage
                }
            });
            console.log('API Response:', res.data);
            if (Array.isArray(res.data.tour)) {
                setPackages(res.data.tour);
            } else {
                console.error('Unexpected response structure:', res.data);
                setPackages([]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch packages');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage]);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleSave = async () => {
        setLoading(true);
        try {
            let photoUrl = currentPackage.photo;

            if (file) {
                // Upload the file and get the URL
                const formData = new FormData();
                formData.append('photo', file); // Use 'file' as the key
                
            }

            const packageData = { ...currentPackage, photo: photoUrl };

            if (currentPackage._id) {
                // Update existing package
                await axios.put(`${BASE_URL}/Tour/Update/${currentPackage._id}`, packageData);
                setSnackbarMessage('Package updated successfully');
            } else {
                // Create new package
                await axios.post(`${BASE_URL}/Tour/Add`, packageData);
                setSnackbarMessage('Package added successfully');
            }

            setSnackbarSeverity('success');
            setOpen(false);
            await fetchPackages(); // Refresh package list after saving

        } catch (err) {
            console.error('Error details:', err.message);
            setSnackbarMessage('Failed to save package');
            setSnackbarSeverity('error');
        } finally {
            setLoading(false);
            setSnackbarOpen(true); // Show the snackbar
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BASE_URL}/Tour/Delete/${id}`);
            setSnackbarMessage('Package deleted successfully');
            setSnackbarSeverity('success');
            // Refresh the current page after deleting a package
            await fetchPackages();
        } catch (err) {
            console.error('Error details:', err.response ? err.response.data : err.message);
            setSnackbarMessage('Failed to delete package');
            setSnackbarSeverity('error');
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false); // Close the confirmation dialog
            setSnackbarOpen(true); // Show the snackbar
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentPackage(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleOpenAddDialog = () => {
        setCurrentPackage({
            _id: '',
            title: '',
            city: '',
            address: '',
            distance: '',
            photo: '',
            desc: '',
            price: '',
            maxGroupSize: '',
            featured: false
        });
        setFile(null); // Clear file input
        setOpen(true);
    };

    const handleOpenEditDialog = (pkg) => {
        setCurrentPackage(pkg);
        setFile(null); // Clear file input
        setOpen(true);
    };

    const handleOpenConfirmDialog = (pkg) => {
        setPackageToDelete(pkg);
        setConfirmDialogOpen(true);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to 0 when rowsPerPage changes
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    if (loading) return <CircularProgress />;
    if (error) return <div>{error}</div>;

    return (
        <Container maxWidth="lg">
            
            <Grid container spacing={2}>
                <Sidebar />
                <Grid item xs={12} md={9}>
                    <Typography variant="h4" gutterBottom>
                        Holiday Packages
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleOpenAddDialog} style={{ marginBottom: 16 }}>
                        Add New Package
                    </Button>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Serial No.</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Distance</TableCell>
                                <TableCell>Photo</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Max Group Size</TableCell>
                                <TableCell>Featured</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {packages.length > 0 ? (
                                packages.map((pkg, index) => (
                                    <TableRow key={pkg._id}>
                                        <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                                        <TableCell>{pkg.title}</TableCell>
                                        <TableCell>{pkg.city}</TableCell>
                                        <TableCell>{pkg.address}</TableCell>
                                        <TableCell>{pkg.distance}</TableCell>
                                        <TableCell><img src={pkg.photo} alt={pkg.title} width={50} /></TableCell>
                                        <TableCell>{pkg.desc}</TableCell>
                                        <TableCell>{pkg.price}</TableCell>
                                        <TableCell>{pkg.maxGroupSize}</TableCell>
                                        <TableCell>{pkg.featured ? 'Yes' : 'No'}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="secondary" onClick={() => handleOpenConfirmDialog(pkg)}>
                                                Delete
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenEditDialog(pkg)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11}>No packages available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={packages.length} // Adjust based on the total number of packages available
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Grid>
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>{currentPackage._id ? 'Edit' : 'Add'} Package</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Title"
                                name="title"
                                fullWidth
                                value={currentPackage.title}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                label="City"
                                name="city"
                                fullWidth
                                value={currentPackage.city}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                label="Address"
                                name="address"
                                fullWidth
                                value={currentPackage.address}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                label="Distance"
                                name="distance"
                                type="number"
                                fullWidth
                                value={currentPackage.distance}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                label="Photo URL (or upload image)"
                                name="photo"
                                fullWidth
                                value={currentPackage.photo}
                                onChange={handleChange}
                            />
                            <input
                                type="file"
                                name='photo'
                                id='file-upload'
                                onChange={handleFileChange}
                                style={{ marginTop: 16 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                label="Description"
                                name="desc"
                                fullWidth
                                value={currentPackage.desc}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                label="Price"
                                name="price"
                                type="number"
                                fullWidth
                                value={currentPackage.price}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                label="Max Group Size"
                                name="maxGroupSize"
                                type="number"
                                fullWidth
                                value={currentPackage.maxGroupSize}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="featured"
                                        checked={currentPackage.featured}
                                        onChange={handleChange}
                                    />
                                }
                                label="Featured"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} fullWidth>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">Are you sure you want to delete this package?</Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (packageToDelete) {
                                handleDelete(packageToDelete._id);
                            }
                        }}
                        color="secondary"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                action={
                    <Button color="inherit" onClick={handleCloseSnackbar}>
                        Close
                    </Button>
                }
                severity={snackbarSeverity}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default HolidayPackagePanel;
