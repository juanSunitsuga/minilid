import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import config from '../../config/config.json';
const app = express();

// Enable CORS with credentials
// app.use(cors({
//     origin: 'http://localhost:5173', 
//     credentials: true,
// }));

app.use(express.json());


const sequelize = new Sequelize({
    // ...config.development,
});


// app.use('/auth', registerLoginRoutes);
// app.use(error)

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});