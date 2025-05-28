import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize-typescript';

// Import models
import { Appliers } from '../../models/appliers';
import { Attachments } from '../../models/attachments';
import { Branch } from '../../models/branch';
import { Chats } from '../../models/chats';
import { Companies } from '../../models/companies';
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
import { JobAppliers } from '../../models/job_appliers';

// Import routes
import registerLoginRoutes from './routes/registerLoginRoutes';
import createPostRoutes from './routes/createPostRoutes';
import profileRoutes from './routes/profileRoutes';
import chatRoutes from './routes/chatRoutes';
import applyJobRoutes from './routes/applyJobRoutes';
import interviewRoutes from './routes/interviewRoutes';

// Import configuration
import config from '../../config/config.json';

const app = express();

// MIDDLEWARE - define only once
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE SETUP
const sequelize = new Sequelize({
    ...config.development,
    models: [
        Appliers, Attachments, Branch, Chats, 
        Companies, Experiences, InterviewSchedules, 
        JobCategories, JobPosts, JobTypes, 
        Messages, Recruiters, Skills, 
        JobPostSkill, ApplierSkill, JobAppliers
    ]
});

// Initialize database connection
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        
        await sequelize.sync({ 
          force: false, 
          alter: true,
          hooks: true
        });
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// ROUTES
app.use('/auth', registerLoginRoutes);
app.use('/profile', profileRoutes);
app.use('/job', createPostRoutes);
app.use('/chat', chatRoutes);
app.use('/job-applications', applyJobRoutes);
app.use('/interviews', interviewRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await initializeDatabase();
    console.log(`Server is running on port ${PORT}`);
});

export default app;