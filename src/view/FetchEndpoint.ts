export const FetchEndpoint = async (endpoint: string, method: string, token: string | null, body?: any) => {
  // Replace process.env with a direct string
  const baseUrl = 'http://localhost:3000'; 
  
  console.log(`${method} request to ${endpoint}:`, body);
  
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
    console.log('Request URL:', `${baseUrl}${endpoint}`);
    console.log('Request method:', method);
    console.log('Request token:', token);

    const response = await fetch(`${baseUrl}${endpoint}`, options);

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