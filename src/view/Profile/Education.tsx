import React from 'react';

const Education: React.FC = () => {
    const educationList = [
        {
            institution: 'University of Example',
            degree: 'Bachelor of Science in Computer Science',
            year: '2018 - 2022'
        },
        {
            institution: 'Example High School',
            degree: 'High School Diploma',
            year: '2014 - 2018'
        }
    ];

    return (
        <div className="education">
            <h2>Education</h2>
            <ul>
                {educationList.map((edu, index) => (
                    <li key={index}>
                        <h3>{edu.degree}</h3>
                        <p>{edu.institution}</p>
                        <p>{edu.year}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Education;