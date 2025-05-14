import express from 'express';
import { Sequelize } from 'sequelize-typescript';
const app = express();
import cors from 'cors';
import { Appliers } from '../../models/appliers';
import { Attachments } from '../../models/attachments';
import { Branch } from '../../models/branch';
import { Chats } from '../../models/chats';
import { CompanyAccounts } from '../../models/company_accounts';
import { Company } from '../../models/company';
import { Experiences } from '../../models/experiences';
import { InterviewSchedules } from '../../models/interview_schedules';
import { JobCategories } from '../../models/job_categories';
import { JobPosts } from '../../models/job_posts';
import { JobTypes } from '../../models/job_types';
import { Messages } from '../../models/messages';
import { Recruiters } from '../../models/recruiters';
import { Skills } from '../../models/skills';
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
    models: [Appliers, Attachments, Branch, Chats, CompanyAccounts, Company, Experiences, 
        InterviewSchedules, JobCategories, JobPosts, JobTypes, Messages, Recruiters, Skills,
        User, // Add your models here
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