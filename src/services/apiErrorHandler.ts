import { toast } from 'react-toastify';

// Flag to prevent multiple alerts from showing at once
let isSessionExpirationHandled = false;

export const handleApiError = (error: any) => {
    const status = error.response?.status;

    // Specifically handle 401 errors (unauthorized/expired token)
    if (status === 401) {
        // Check if we're already handling a session expiration
        if (!isSessionExpirationHandled) {
            isSessionExpirationHandled = true;

            // Show alert
            toast.error('Your session has expired. Please login again.', {
                onClose: () => {
                    isSessionExpirationHandled = false; // Reset flag when alert is closed
                    window.location.href = '/'; // Redirect to login page
                }
            });

            // Clear stored token
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
        }
        return;
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', errorMessage);

    toast.error(errorMessage);
};