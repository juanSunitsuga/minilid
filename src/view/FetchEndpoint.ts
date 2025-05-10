const API_BASE_URL = 'http://localhost:3000'; // Change this to match your API URL

export const FetchEndpoint = async (url: string, method: string, headers: any, body: any): Promise<Response> => {
  try {
    // Create standard fetch options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
      },
      body: body ? JSON.stringify(body) : undefined
    };

    // Use fetch to make the request
    console.log(`Making ${method} request to ${API_BASE_URL}${url}`, body);
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    
    // Log the response status
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Return the Response object directly
    return response;
  } catch (error) {
    console.error(`Error in fetchEndpoint for ${method} ${url}:`, error);
    
    // Create a mock Response object for client-side errors
    // This ensures that response.json() is always available
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};