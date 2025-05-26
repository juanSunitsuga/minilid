import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import Experience from './Experience';
import Education from './Education';
import Skills from './Skills';
import { FetchEndpoint } from '../FetchEndpoint';
import { useAuth } from '../Context/AuthContext';

// User profile data interface
interface UserProfile {
  id: number;
  name: string;
  profilePicture?: string;
  headline?: string;
  skills: string[];
  userType: 'applier' | 'recruiter';
}

const Profile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userData, userType, isAuthenticated } = useAuth();

    useEffect(() => {
        // Check if authenticated
        if (!isAuthenticated || !userData) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        // Get auth token from localStorage
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            setError('Authentication token not found');
            setLoading(false);
            return;
        }

        // Fetch user profile data with appropriate endpoint
        const fetchProfile = async () => {
            try {
                // Select the endpoint based on user type
                const endpoint = userType === 'applier' 
                    ? `/profile/appliers/${userData.user_id}`
                    : `/profile/recruiters?recruiter_id=${userData.user_id}`;
                
                const response = await FetchEndpoint(endpoint, 'GET', token);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch profile: ${response.status}`);
                }
                
                const responseData = await response.json();
                const profileData = responseData.data || responseData;
                
                // Transform the data to match our UserProfile interface
                const formattedProfile: UserProfile = {
                    id: parseInt(userData.user_id),
                    name: profileData.name || userData.name,
                    profilePicture: profileData.profile_picture,
                    headline: profileData.headline || (userType === 'recruiter' ? profileData.position : ''),
                    skills: profileData.skills?.map((s: any) => s.name) || [],
                    userType: userType as 'applier' | 'recruiter'
                };
                
                console.log('Fetched profile data:', formattedProfile);

                setProfile(formattedProfile);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userData, userType, isAuthenticated]);

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!profile) return <div>No profile data available</div>;

    return (
        <div className="profile-container">
            <ProfileHeader 
                name={profile.name}
                profilePicture={profile.profilePicture || "/default-avatar.png"}
                headline={profile.headline || ""}
            />
            <Experience userId={userData?.user_id} userType={userType as 'applier' | 'recruiter'} />
            <Education />
            <Skills skills={profile.skills || []} />
            
            {/* Show different components based on user type */}
            {profile.userType === 'applier' ? (
                <div className="applier-specific-section">
                    {/* Applier-specific content */}
                </div>
            ) : (
                <div className="recruiter-specific-section">
                    {/* Recruiter-specific content */}
                </div>
            )}
        </div>
    );
};

export default Profile;