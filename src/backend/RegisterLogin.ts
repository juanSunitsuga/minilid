import express, { Request, Response } from 'express';
import { Sequelize } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { Recruiters } from '../../models/recruiters';
import { Appliers } from '../../models/appliers';
import { jwtConfig } from '../../config/jwt';
import { body } from 'express-validator/check';
import { validationResult } from 'express-validator/check';

const router = express.Router();
const SALT_ROUNDS = 10;

// Validation middleware
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('userType').isIn(['applicant', 'recruiter']).withMessage('User type must be applicant or recruiter'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').isIn(['applicant', 'recruiter']).withMessage('User type must be applicant or recruiter'),
];

router.post('/register', registerValidation, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, userType, company, position, ...additionalData } = req.body;
    
    // Check if user already exists
    const userModel = userType === 'applicant' ? Appliers : Recruiters;
    const existingUser = await userModel.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json({ 
        message: `${userType === 'applicant' ? 'Applicant' : 'Recruiter'} with this email already exists` 
      });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashedEmail = await bcrypt.hash(email, SALT_ROUNDS);
    
    // Create new user based on type
    let newUser;
    if (userType === 'appliers') {
      newUser = await Appliers.create({
        hashedEmail,
        password: hashedPassword,
        name,
        ...additionalData
      });
    } else {
      // Recruiter specific validation
      if (!company) {
        return res.status(400).json({ message: 'Company name is required for recruiters' });
      }

      newUser = await Recruiters.create({
        hashedEmail,
        password: hashedPassword,
        name,
        company,
        position,
        ...additionalData
      });
    }
    
    // Generate tokens
    const userData = {
      id: newUser.id,
      email: newUser.email,
      userType
    };
    
    const accessToken = jwtConfig.generateAccessToken(userData);
    
    // Remove password from response
    const userResponse = { ...newUser.get() };
    delete userResponse.password;
    
    return res.status(201).json({
      message: `${userType === 'applicant' ? 'Applicant' : 'Recruiter'} registered successfully`,
      user: userResponse,
      accessToken
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * Login for existing users (applicant or recruiter)
 */
router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType } = req.body;
    
    // Select the appropriate model based on user type
    const userModel: typeof Appliers | typeof Recruiters = userType === 'appliers' ? Appliers : Recruiters;
    
    // Find the user
    const user = await userModel.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate tokens
    const userData = {
      id: user.id,
      email: user.email,
      userType
    };
    
    const accessToken = jwtConfig.generateAccessToken(userData);
    
    // Remove password from response
    const userResponse = { ...user.get() };
    delete userResponse.password;
    
    return res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      accessToken
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * Get current user's profile
 * This route would typically be protected by auth middleware
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // The auth middleware would normally add the user to the request
    // For this example, we're expecting the user ID and type from the query
    // In production, get this from the JWT token
    const { id, userType } = req.query;
    
    if (!id || !userType) {
      return res.status(400).json({ message: 'User ID and type are required' });
    }
    
    const userModel = userType === 'applicant' ? Appliers : Recruiters;
    const user = await userModel.findByPk(id as string);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const userResponse = { ...user.get() };
    delete userResponse.password;
    
    return res.status(200).json({
      user: userResponse
    });
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

export default router;