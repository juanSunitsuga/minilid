import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize-typescript';

// Import other routers as needed
import { Appliers } from '../../models/appliers';
import { Attachments } from '../../models/attachments';
import { Branch } from '../../models/branch';
import { Chats } from '../../models/chats';
import { Company } from '../../models/company';
import { Experiences } from '../../models/experiences';
import { InterviewSchedules } from '../../models/interview_schedules';
import { JobCategories } from '../../models/job_categories';
import { JobPosts } from '../../models/job_posts';
import { JobTypes } from '../../models/job_types';
import { Messages } from '../../models/messages';
import { Recruiters } from '../../models/recruiters';
import { Skills } from '../../models/skills';
import { JobPostSkill } from '../../models/job_post_skills';
import { ApplierSkill } from '../../models/applier_skills';

import registerLoginRoutes from './routes/registerLoginRoutes';
import createPostRoutes from './routes/createPostRoutes';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

app.use(express.json());


import config from '../../config/config.json'; // Adjust the path to your configuration file

const sequelize = new Sequelize({
    ...config.development,
    models: [Appliers, Attachments, Branch, Chats, Company, Experiences, 
        InterviewSchedules, JobCategories, JobPosts, JobTypes, Messages, Recruiters, Skills, JobPostSkill,
        ApplierSkill
    ]
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers at specific paths
app.use('/auth', registerLoginRoutes);
app.use('/job', createPostRoutes);

// Default 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;