import React, { createContext, useState, useContext, useEffect } from 'react';
import { FetchEndpoint } from '../FetchEndpoint';
import { useNavigate } from 'react-router-dom';

interface BaseUserData {
  email: string;
  name: string;
}

interface ApplierData extends BaseUserData {
  user_id: string;
  userType: 'applier';
  about?: string;
}

interface RecruiterData extends BaseUserData {
  user_id: string;
  userType: 'recruiter';
  company?: string;
  position?: string;
}

interface CompanyData {
  id: string;
  name: string;
  email: string;
  address?: string;
  website?: string;
  logoUrl?: string;
}

type UserData = ApplierData | RecruiterData | null;
type CompanyInfo = CompanyData | null;

interface AuthContextType {
  userData: UserData;
  companyData: CompanyInfo;
  userType: 'applier' | 'recruiter' | 'company' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // General functions
  logout: () => void;
  refreshUserData: () => Promise<void>;
  
  // Individual user login/register
  loginUser: (email: string, password: string, userType: 'applier' | 'recruiter') => Promise<void>;
  registerUser: (userData: any) => Promise<void>;
  
  // Company login/register
  loginCompany: (email: string, password: string) => Promise<void>;
  registerCompany: (companyData: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<UserData>(null);
    const [companyData, setCompanyData] = useState<CompanyInfo>(null);
    const [userType, setUserType] = useState<'applier' | 'recruiter' | 'company' | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Function to refresh user data from tokens in localStorage
    const refreshUserData = async () => {
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const storedUserType = localStorage.getItem('userType') as 'applier' | 'recruiter' | 'company' | null;

            if (!token || !storedUserType) {
                setIsAuthenticated(false);
                setUserType(null);
                setUserData(null);
                setCompanyData(null);
                return;
            }

            // Check token validity with backend
            const verifyResponse = await FetchEndpoint('/auth/verify', 'GET', token, null);
            if (!verifyResponse.ok) {
                // Token invalid or expired
                logout();
                return;
            }

            // User is authenticated based on token presence and verification
            setIsAuthenticated(true);
            setUserType(storedUserType);
            
            // Set appropriate data based on user type
            if (storedUserType === 'company') {
                const companyInfo: CompanyData = {
                    id: localStorage.getItem('companyId') || '',
                    name: localStorage.getItem('companyName') || '',
                    email: localStorage.getItem('companyEmail') || '',
                };
                console.log('Setting company data:', companyInfo);
                setCompanyData(companyInfo);
                setUserData(null);
            } else {
                // For applier or recruiter
                const user: ApplierData | RecruiterData = {
                    user_id: localStorage.getItem('userId') || '',
                    name: localStorage.getItem('userName') || '',
                    email: localStorage.getItem('userEmail') || '',
                    userType: storedUserType as 'applier' | 'recruiter',
                };
                console.log('Setting user data:', user);
                setUserData(user);
                setCompanyData(null);
            }
            
        } catch (error) {
            console.error('Error refreshing user data:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (email: string, password: string, type: 'applier' | 'recruiter') => {
        try {
            setIsLoading(true);
            const endpoint = type === 'applier' ? '/auth/login-applier' : '/auth/login-recruiter';
            
            const response = await FetchEndpoint(endpoint, 'POST', null, { email, password });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            
            const responseData = await response.json();
            const data = responseData.data || responseData;
            
            // Set auth token in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('userType', type);
            
            if (data.user) {
                localStorage.setItem('userId', data.user.user_id);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                
                // Update state
                setUserData({
                    user_id: data.user.user_id,
                    name: data.user.name,
                    email: data.user.email,
                    userType: type,
                } as UserData);
            }
            
            setUserType(type);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginCompany = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await FetchEndpoint('/auth/login-company', 'POST', null, { 
                companyEmail: email, 
                companyPassword: password 
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            
            const responseData = await response.json();
            const data = responseData.data || responseData;
            
            // Set auth token in localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('userType', 'company');
            
            if (data.company) {
                localStorage.setItem('companyId', data.company.id);
                localStorage.setItem('companyName', data.company.name);
                localStorage.setItem('companyEmail', data.company.email);
                
                if (data.company.address) {
                    localStorage.setItem('companyAddress', data.company.address);
                }
                
                if (data.company.website) {
                    localStorage.setItem('companyWebsite', data.company.website);
                }
                
                // Update state
                setCompanyData({
                    id: data.company.id,
                    name: data.company.name,
                    email: data.company.email,
                    address: data.company.address,
                    website: data.company.website,
                });
            }
            
            setUserType('company');
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Company login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const registerUser = async (userData: any) => {
        try {
            setIsLoading(true);
            const endpoint = userData.userType === 'applier' 
                ? '/auth/register-applier' 
                : '/auth/register-recruiter';
            
            const response = await FetchEndpoint(endpoint, 'POST', null, userData);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 
                    (errorData.errors && errorData.errors.join(', ')) || 
                    'Registration failed'
                );
            }
            
            // You can also handle auto-login after registration here if needed
            const responseData = await response.json();
            const data = responseData.data || responseData;
            
            // For now, we'll just return without setting authentication
            // This allows us to route to login after registration instead
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const registerCompany = async (companyData: any) => {
        try {
            setIsLoading(true);
            
            const response = await FetchEndpoint('/auth/register-company', 'POST', null, companyData);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 
                    (errorData.errors && errorData.errors.join(', ')) || 
                    'Company registration failed'
                );
            }
            
            // You can also handle auto-login after registration here if needed
            const responseData = await response.json();
            const data = responseData.data || responseData;
            
            // For now, we'll just return without setting authentication
            return data;
        } catch (error) {
            console.error('Company registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Clear all auth-related data from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('companyId');
        localStorage.removeItem('companyName');
        localStorage.removeItem('companyEmail');
        localStorage.removeItem('companyAddress');
        localStorage.removeItem('companyWebsite');
        
        // Reset state
        setUserData(null);
        setCompanyData(null);
        setUserType(null);
        setIsAuthenticated(false);
        navigate('/'); 
    };

    // Load user data when the app initializes
    useEffect(() => {
        refreshUserData();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                userData,
                companyData,
                userType,
                isAuthenticated,
                isLoading,
                logout,
                refreshUserData,
                loginUser,
                registerUser,
                loginCompany,
                registerCompany,
              }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};