import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize-typescript';

// Import models
import { Appliers } from '../../models/appliers';
import { Companies } from '../../models/companies';
import { Experiences } from '../../models/experiences';
import { JobCategories } from '../../models/job_categories';
import { JobPosts } from '../../models/job_posts';
import { JobTypes } from '../../models/job_types';
import { Recruiters } from '../../models/recruiters';
import { Skills } from '../../models/skills';
import { JobPostSkill } from '../../models/job_post_skills';
import { ApplierSkill } from '../../models/applier_skill';
import { JobAppliers } from '../../models/job_appliers';

// Import routes
import registerLoginRoutes from './routes/registerLoginRoutes';
import createPostRoutes from './routes/createPostRoutes';
import profileRoutes from './routes/profileRoutes';
import chatRoutes from './routes/chatRoutes';
import applyJobRoutes from './routes/applyJobRoutes';
import error from '../middleware/errorHandler';
import experiencesRoutes from './routes/experiencesRoutes';
import skillsRoutes from './routes/skillsRoutes';

// Import configuration
import config from '../../config/config.json';

const app = express();

// MIDDLEWARE - define only once
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));
app.use(express.json({ 
  limit: '50mb' // Increase from default 1mb to 50mb
}));
app.use(express.urlencoded({ extended: true, limit: '50mb'  }));

import { Dialect } from 'sequelize';
// DATABASE SETUP
const sequelize = new Sequelize({
    ...config.development,
    dialect: config.development.dialect as Dialect,
    models: [
        Appliers, Companies, Experiences, 
        JobCategories, JobPosts, JobTypes, Recruiters, 
        Skills, JobPostSkill, ApplierSkill, JobAppliers
    ]
});

// ROUTES
app.use('/auth', registerLoginRoutes);
app.use('/profile', profileRoutes);
app.use('/job', createPostRoutes);
app.use('/chat', chatRoutes);
app.use('/job-applications', applyJobRoutes);
app.use('/experiences', experiencesRoutes);
app.use('/companies', interviewRoutes);
app.use('/skills', skillsRoutes);
app.use(error);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;