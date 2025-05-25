import React from 'react';

interface ProfileHeaderProps {
    name: string;
    profilePicture: string;
    headline: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, profilePicture, headline }) => {
    return (
        <div className="profile-header">
            <img src={profilePicture} alt={`${name}'s profile`} className="profile-picture" />
            <h1 className="profile-name">{name}</h1>
            <h2 className="profile-headline">{headline}</h2>
        </div>
    );
};

export default ProfileHeader;