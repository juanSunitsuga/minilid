import express from 'express';
import { Sequelize } from 'sequelize-typescript';
const app = express();
import cors from 'cors';
import { Attachments } from '../../models/attachments';
import { Branch } from '../../models/branch';
import { Chats } from '../../models/chats';
import { Experiences } from '../../models/experiences';
import { InterviewSchedules } from '../../models/interview_schedules';
import { JobCategories } from '../../models/job_categories';
import { JobPosts } from '../../models/job_posts';
import { JobTypes } from '../../models/job_types';
import { Messages } from '../../models/messages';
import { Skills } from '../../models/skills';
import { Company } from '../../models/company';
import { User } from '../../models/users';

import registerLoginRoutes from './routes/registerLoginRoutes';


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());


import config from '../../config/config.json'; // Adjust the path to your configuration file

const sequelize = new Sequelize({
    ...config.development,
    models: [Attachments, Branch, Chats, Company, Experiences, InterviewSchedules, 
        JobCategories, JobPosts, JobTypes, Messages, Skills, User, // Add your models here
    ]
});

console.log("hello")


app.use('/auth', registerLoginRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});