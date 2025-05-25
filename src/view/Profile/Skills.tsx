import React from 'react';

const Skills: React.FC<{ skills: string[] }> = ({ skills }) => {
    return (
        <div>
            <h2>Skills</h2>
            <ul>
                {skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                ))}
            </ul>
        </div>
    );
};

export default Skills;