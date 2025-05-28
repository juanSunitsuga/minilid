import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { Appliers } from '../../../models/appliers';
import { Recruiters } from '../../../models/recruiters';
import { Companies } from '../../../models/companies';
import { appConfig } from '../../../config/app';
import { v4 } from 'uuid';
import { controllerWrapper } from '../../../src/utils/controllerWrapper';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

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

function validateUserLogin(req: Request): string[] {
  const errors: string[] = [];
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    errors.push('Please enter a valid email');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
}

// For company registration
router.post('/register-company', controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validateCompanyRegistration(req);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  const { companyName, companyAddress, companyWebsite, companyEmail, companyPassword } = req.body;

  const existingCompany = await Companies.findOne({
    where: { company_email: companyEmail }
  });

  if (existingCompany) {
    throw new Error(`Company with this email already exists`);
  }

  const hashedPassword = await bcrypt.hash(companyPassword, SALT_ROUNDS);

  const newCompany = await Companies.create({
    company_id: v4(),
    company_name: companyName,
    company_email: companyEmail,
    password: hashedPassword,
    address: companyAddress || null,
    website: companyWebsite || null,
  });

  return {
    data: {
      message: 'Company registered successfully',
      company: {
        id: newCompany.company_id,
        name: newCompany.company_name,
        address: newCompany.address,
        website: newCompany.website,
        email: newCompany.company_email,
      }
    }
  };
}));

// Applier registration route with wrapper
router.post('/register-applier', controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  console.log("registering applier", req.body);

  const errors = validateRegistration(req);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  const { email, password, name, ...additionalData } = req.body;

  req.body.userType = 'applier';

  const existingUser = await Appliers.findOne({ where: { email } });

  if (existingUser) {
    throw new Error(`User with this email already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await Appliers.create({
    user_id: v4(),
    email,
    password: hashedPassword,
    name,
    userType: 'applier',
  });

  // Generate token
  const userData = {
    id: newUser.applier_id,
    email: newUser.email,
    name: newUser.name,
  };

  const userResponse = { ...newUser.get() };
  delete userResponse.password;

  return {
    data: {
      message: `Applier registered successfully`,
      user: {
        user_id: userResponse.user_id,
        name: userResponse.name,
        email: userResponse.email,
        usertype: userResponse.usertype
      }
    }
  };
}));

// Recruiter registration route with wrapper
router.post('/register-recruiter', controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  console.log("registering recruiter", req.body);

  const errors = validateRegistration(req);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  req.body.userType = 'recruiter';

  const { email, password, name, companyName, position, ...additionalData } = req.body;

  const existingUser = await Recruiters.findOne({ where: { email } });

  if (existingUser) {
    throw new Error(`User with this email already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const company = await Companies.findOne({
    where: { company_name: { [Op.iLike]: companyName } },
  })

  const newUser = await Recruiters.create({
    user_id: v4(),
    email,
    password: hashedPassword,
    name,
    company_id: company ? company.company_id : null,
    position
  });

  // Generate token
  const userData = {
    id: newUser.recruiter_id,
    email: newUser.email,
    name: newUser.name,
  };

  const userResponse = { ...newUser.get() };
  delete userResponse.password;

  return {
    data: {
      message: `Recruiter registered successfully`,
      user: {
        user_id: userResponse.user_id,
        name: userResponse.name,
        email: userResponse.email,
        usertype: userResponse.usertype
      }
    }
  };
}));


// Applier login route with wrapper
router.post('/login-applier', controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validateUserLogin(req);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  const { email, password } = req.body;

  const user = await Appliers.findOne({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const userData = {
    id: user.applier_id,
    email: user.email,
    name: user.name
  };

  const accessToken = jwt.sign(
    { id: userData.id, email: userData.email },
    appConfig.jwtSecret,
    { expiresIn: '1h' }
  );

  console.log('Generated access token:', accessToken);

  // Remove password from response
  const userResponse = { ...user.get() };
  delete userResponse.password;

  return {
    data: {
      message: 'Login successful',
      user: {
        user_id: userResponse.applier_id,
        name: userResponse.name,
        email: userResponse.email
      },
      accessToken
    }
  };
}));

// Recruiter login route with wrapper
router.post('/login-recruiter', controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validateUserLogin(req);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  const { email, password } = req.body;

  const user = await Recruiters.findOne({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const userData = {
    id: user.recruiter_id,
    email: user.email,
    name: user.name
  };

  const accessToken = jwt.sign(
    { id: userData.id, email: userData.email },
    appConfig.jwtSecret,
    { expiresIn: '1h' }
  );

  // Remove password from response
  const userResponse = { ...user.get() };
  delete userResponse.password;

  return {
    data: {
      message: 'Login successful',
      user: {
        user_id: userResponse.recruiter_id,
        name: userResponse.name,
        email: userResponse.email
      },
      accessToken
    }
  };
}));

// Company login route with wrapper
router.post('/login-company', controllerWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const { companyEmail, companyPassword } = req.body;

  const company = await Companies.findOne({
    where: { company_email: companyEmail }
  });

  if (!company) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(companyPassword, company.password);

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const accessToken = jwt.sign(
    { id: company.company_id, email: company.company_email },
    appConfig.jwtSecret,
    { expiresIn: '1h' }
  )

  return {
    data: {
      message: 'Login successful',
      company: {
        id: company.company_id,
        name: company.company_name,
        address: company.address,
        website: company.website,
        email: company.company_email,
      },
      accessToken
    }
  };
}));

export default router;