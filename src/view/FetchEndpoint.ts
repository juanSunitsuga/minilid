import { handleApiError } from '../services/apiErrorHandler';

export const FetchEndpoint = async (endpoint: string, method: string, token: string | null, body: any) => {
  // Check if token is expired before making the request

  // Make sure you're using the correct base URL
  const BASE_URL = 'http://localhost:3000'; // Confirm this is the correct port

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

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

    const clone = response.clone();
    try {
      const responseData = await clone.text();
    } catch (e) {
      console.error('Could not read response body for logging:', e);
    }

    if (!response.ok) {
      const error = {
        response: {
          status: response.status,
          data: { message: response.statusText }
        }
      };
      
      try {
        const errorBody = await response.json();
        error.response.data = errorBody;
      } catch {

      }
      
      // Handle the error via our centralized handler
      handleApiError(error);
      
      // Re-throw so components can still handle it if needed
      throw error;
    }

    return response;
  } catch (error) {
    // This catches network errors (like no internet)
    // or errors thrown above after handling
    if (!(error as any)?.response) {
      // If this isn't a response error we already handled,
      // create one and pass it to the handler
      const networkError = {
        response: {
          status: 0,
          data: { message: 'Network error. Please check your connection.' }
        }
      };
      handleApiError(networkError);
    }
    
    // Re-throw for component-level handling
    throw error;
  }
};