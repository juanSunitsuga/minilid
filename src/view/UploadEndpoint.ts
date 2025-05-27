export const uploadEndpoint = async (endpoint: string, token: string, formData: FormData) => {
  const BASE_URL = 'http://localhost:3000';
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method: 'POST',
    headers,
    body: formData // Direct FormData, not stringified
  };
  
  return fetch(`${BASE_URL}${path}`, options);
};