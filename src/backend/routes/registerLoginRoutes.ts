import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserType } from '../../../models/users';
import { Company } from '../../../models/company';
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

  if (!email || !validateEmail(email)) {
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

// Company registration validation
function validateCompanyRegistration(req: Request): string[] {
  const errors: string[] = [];
  const { companyName, companyEmail, companyPassword } = req.body;
  
  console.log('Company registration validation - received fields:', { 
    companyName, companyEmail, companyPassword 
  });

  if (!companyName) {
    errors.push('Company name is required');
  }

  if (!companyEmail || !validateEmail(companyEmail)) {
    errors.push('Please enter a valid company email');
  }

  if (!companyPassword || companyPassword.length < 8) {
    errors.push('Company password must be at least 8 characters');
  }
  
  console.log('Validation errors:', errors);
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

// For company registration
router.post('/register-company', async (req: Request, res: Response) => {
  try {
    // Validation remains the same
    
    const { companyName, companyAddress, companyWebsite, companyEmail, companyPassword } = req.body;
    
    // Check if company email already exists in the consolidated table
    const existingCompany = await Company.findOne({ 
      where: { company_email: companyEmail }
    });
    
    if (existingCompany) {
      return res.status(409).json({ message: 'Company with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(companyPassword, SALT_ROUNDS);
    
    // Create company in the consolidated table
    const newCompany = await Company.create({
      company_id: v4(),
      company_name: companyName,
      company_email: companyEmail,
      password: hashedPassword,
      address: companyAddress || null,
      website: companyWebsite || null,
    });

    // Generate token
    const accessToken = appConfig.generateAccessToken(newCompany.company_id);

    return res.status(201).json({
      message: 'Company registered successfully',
      company: {
        id: newCompany.company_id,
        name: newCompany.company_name,
        address: newCompany.address,
        website: newCompany.website,
        email: newCompany.company_email,
      },
      accessToken
    });
  } catch (error) {
    console.error('Company registration error:', error);
    return res.status(500).json({ message: 'Server error during company registration' });
  }
});

// Update user registration to use the consolidated User table
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log("registering user", req.body);

    // Manual validation
    const errors = validateRegistration(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { email, password, name, userType, ...additionalData } = req.body;

    // Check if user already exists using the new User model
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({
        message: `User with this email already exists`
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user with usertype field
    const newUser = await User.create({
      user_id: v4(),
      email,
      password: hashedPassword,
      name,
      usertype: userType === 'applier' ? UserType.APPLIER : UserType.RECRUITER,
      // Any additional fields can be added here
    });

    // Generate token
    const userData = {
      id: newUser.user_id,
      email: newUser.email,
      userType: newUser.usertype
    };

    const accessToken = appConfig.generateAccessToken(userData.id);
    
    // Remove password from response
    const userResponse = { ...newUser.get() };
    delete userResponse.password;

    return res.status(201).json({
      message: `User registered successfully`,
      user: {
        user_id: userResponse.user_id,
        name: userResponse.name,
        email: userResponse.email,
        usertype: userResponse.usertype
      },
      accessToken,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * Login for existing company accounts
 */
router.post('/login-company', async (req: Request, res: Response) => {
  try {
    const { companyEmail, companyPassword } = req.body;

    // Find the company in the consolidated table
    const company = await Company.findOne({ 
      where: { company_email: companyEmail } 
    });

    if (!company) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(companyPassword, company.password);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const accessToken = appConfig.generateAccessToken(company.company_id);

    return res.status(200).json({
      message: 'Login successful',
      company: {
        id: company.company_id,
        name: company.company_name,
        address: company.address,
        website: company.website,
        email: company.company_email,
      },
      accessToken
    });
  } catch (error) {
    console.error('Company login error:', error);
    return res.status(500).json({ message: 'Server error during company login' });
  }
});

// Update user login to use the consolidated User table
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Manual validation
    const errors = validateLogin(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const { email, password, userType } = req.body;

    // Find the user in the new User table with the specified type
    const user = await User.findOne({ 
      where: { 
        email,
        usertype: userType === 'applier' ? UserType.APPLIER : UserType.RECRUITER
      } 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const userData = {
      id: user.user_id,
      email: user.email,
      userType: user.usertype
    };

    const accessToken = appConfig.generateAccessToken(userData.id);

    // Remove password from response
    const userResponse = { ...user.get() };
    delete userResponse.password;

    return res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: userResponse.user_id,
        name: userResponse.name,
        email: userResponse.email,
        usertype: userResponse.usertype
      },
      accessToken
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;