import React from 'react';

interface ExperienceProps {
  userId?: string;
  userType: 'applier' | 'recruiter';
}

const Experience: React.FC<ExperienceProps> = ({ userId, userType }) => {
    const experiences = [
        {
            title: "Software Engineer",
            company: "Tech Company",
            duration: "Jan 2020 - Present",
            description: "Developing and maintaining web applications."
        },
        {
            title: "Intern",
            company: "Startup Inc.",
            duration: "Jun 2019 - Dec 2019",
            description: "Assisted in developing new features for the company's product."
        }
    ];

    return (
        <div>
            <h2>Experience</h2>
            <ul>
                {experiences.map((exp, index) => (
                    <li key={index}>
                        <h3>{exp.title} at {exp.company}</h3>
                        <p>{exp.duration}</p>
                        <p>{exp.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Experience;