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
    console.log('Request options:', options);
    console.log('Request headers:', headers);
    console.log('Request body:', body);
    console.log('Request URL:', `${BASE_URL}${path}`);
    console.log('Request method:', method);
    console.log('Request token:', token);

    const response = await fetch(`${BASE_URL}${path}`, options);

    console.log('TEST');
    console.log('Response:', response);
    
    // Log response status
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
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
    console.error('Fetch error:', error);
    throw error;
  }
};