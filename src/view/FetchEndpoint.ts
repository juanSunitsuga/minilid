export const FetchEndpoint = async (endpoint: string, method: string, token: string | null, body: any) => {
  // Make sure you're using the correct base URL
  const BASE_URL = 'http://localhost:3000'; // Confirm this is the correct port

  // Add leading slash if missing
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  console.log(`Making ${method} request to: ${BASE_URL}${path}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);

    // For debugging - log the raw response
    const clone = response.clone();
    try {
      const responseData = await clone.text();
      console.log('Raw response:', responseData);
    } catch (e) {
      console.error('Could not read response body for logging:', e);
    }

    return response;
  } catch (error) {
    throw error;
  }
};