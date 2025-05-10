import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Recruiters } from '../../../models/recruiters';
import { Appliers } from '../../../models/appliers';
import { appConfig } from '../../../config/app';
import { v4 } from 'uuid';

const router = express.Router();
const SALT_ROUNDS = 10;

// Manual validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRegistration(req: Request): string[] {
  const errors: string[] = [];
  const { email, password, name, userType } = req.body;

  if (!validateEmail(email)) {
    errors.push('Please enter a valid email');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!name) {
    errors.push('Name is required');
  }
  
  if (userType !== 'applier' && userType !== 'recruiter') {
    errors.push('User type must be applier or recruiter');
  }
  
  return errors;
}

function validateLogin(req: Request): string[] {
  const errors: string[] = [];
  const { email, password, userType } = req.body;

  if (!validateEmail(email)) {
    errors.push('Please enter a valid email');
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  if (userType !== 'applier' && userType !== 'recruiter') {
    errors.push('User type must be applier or recruiter');
  }
  
  return errors;
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log("registering user", req.body);
    
    // Manual validation
    const errors = validateRegistration(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { email, password, name, userType, company, position, ...additionalData } = req.body;

    // Check if user already exists
    const userModel = userType === 'applier' ? Appliers : Recruiters;
    const existingUser = await userModel.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: `${userType === 'applier' ? 'Applier' : 'Recruiter'} with this email already exists`
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user based on type
    let newUser;
    if (userType === 'applier') {
      newUser = await Appliers.create({
        applier_id: v4(),
        email,
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
        recruiter_id: v4(),
        email,
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

    const accessToken = appConfig.generateAccessToken(userData.id);
    // Remove password from response
    const userResponse = { ...newUser.get() };
    delete userResponse.password;

    return res.status(201).json({
      message: `${userType === 'applier' ? 'Applier' : 'Recruiter'} registered successfully`,
      user: userResponse,
      accessToken,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * Login for existing users (applier or recruiter)
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Manual validation
    const errors = validateLogin(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { email, password, userType } = req.body;

    // Select the appropriate model based on user type
    const userModel = userType === 'applier' ? Appliers : Recruiters;

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

    const accessToken = appConfig.generateAccessToken(userData.id);

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

export default router;