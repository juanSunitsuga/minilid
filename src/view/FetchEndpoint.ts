export const FetchEndpoint = async (
    endpoint: string,
    method: string,
    token?: string | null,
    body?: any
) => {
    
    const baseUrl = 'http://localhost:3000';
    const url = `${baseUrl}${endpoint}`;
    
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
        }
        
        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
            console.log(`Request body included for ${method} request`);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => {
                return { message: 'Unknown error' };
            });
            console.error('Error data from response:', errorData);
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            console.log('Parsed JSON response successfully');
            return jsonData;
        } else {
            const textData = await response.text();
            console.log('Received text response');
            return textData;
        }
    } catch (error) {
        console.error(`Error in fetchEndpoint for ${method} ${endpoint}:`, error);
        throw error;
    }
};