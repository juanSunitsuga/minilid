import express from "express";
import path from "path";
import fs from "fs";
import { JobPosts } from "../../../models/job_posts";
import { Appliers } from "../../../models/appliers";
import { JobAppliers } from "../../../models/job_appliers";
import authMiddleware from "../../middleware/Auth";
import { controllerWrapper } from "../../utils/controllerWrapper";
import jwt from "jsonwebtoken";
import { appConfig } from "../../../config/app";

const router = express.Router();

// ✅ UPDATED: Apply for a job with JSON base64 CV upload
router.post("/apply", authMiddleware, controllerWrapper(async (req, res) => {
  try {
    const userId = req.user?.id;
    const { job_id, cv_file, cv_filename, cv_type, cover_letter } = req.body;

    console.log('📝 Job application request:', {
      userId,
      job_id,
      cv_filename,
      cv_type,
      cover_letter: cover_letter ? 'Provided' : 'Not provided',
      cv_file_size: cv_file ? `${(cv_file.length * 0.75 / 1024 / 1024).toFixed(2)} MB (estimated)` : 'Not provided'
    });

    // Validation
    if (!userId) {
      throw new Error("Unauthorized: User ID not found");
    }

    if (!job_id) {
      throw new Error("Job ID is required");
    }

    if (!cv_file) {
      throw new Error("CV file is required");
    }

    if (!cv_filename) {
      throw new Error("CV filename is required");
    }

    if (!cv_type || cv_type !== 'application/pdf') {
      throw new Error("Only PDF files are allowed");
    }

    // ✅ NEW: Validate base64 string
    if (typeof cv_file !== 'string') {
      throw new Error("Invalid CV file format");
    }

    // ✅ NEW: Estimate file size from base64 (base64 is ~4/3 larger than original)
    const estimatedFileSize = (cv_file.length * 0.75); // Convert base64 length to bytes
    const maxFileSize = 50 * 1024 * 1024; // 50MB limit

    if (estimatedFileSize > maxFileSize) {
      throw new Error(`File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);
    }

    // Find applier
    const applier = await Appliers.findOne({
      where: { applier_id: userId }
    });

    if (!applier) {
      throw new Error("Applier profile not found. Please complete your profile first.");
    }

    // Check if job exists
    const job = await JobPosts.findByPk(job_id);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if already applied
    const existingApplication = await JobAppliers.findOne({
      where: {
        job_id: job_id,
        applier_id: applier.applier_id
      }
    });

    if (existingApplication) {
      throw new Error("You have already applied for this job");
    }

    // ✅ FIXED: Create uploads directory using process.cwd() instead of __dirname
    const uploadDir = path.join(process.cwd(), 'uploads', 'cvs');
    
    console.log('📁 Upload directory:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Created upload directory:', uploadDir);
    }

    // ✅ NEW: Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(cv_filename) || '.pdf';
    const savedFileName = `${userId}_${timestamp}_cv${fileExtension}`;
    const filePath = path.join(uploadDir, savedFileName);

    console.log('📄 File will be saved to:', filePath);

    // ✅ NEW: Convert base64 to file and save
    let savedFilePath = null;
    try {
      const fileBuffer = Buffer.from(cv_file, 'base64');
      fs.writeFileSync(filePath, fileBuffer);
      savedFilePath = filePath; // Store for cleanup if needed
      
      console.log('✅ CV file saved:', {
        originalName: cv_filename,
        savedName: savedFileName,
        path: filePath,
        size: `${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`
      });
    } catch (fileError) {
      console.error('Error saving CV file:', fileError);
      throw new Error("Failed to save CV file");
    }

    // ✅ NEW: Create job application with file path
    try {
      const application = await JobAppliers.create({
        job_id: job_id,
        applier_id: applier.applier_id,
        cv_url: filePath, // Store the file path
        status: 'applied',
        cover_letter: cover_letter || null
      });

      console.log('✅ Application created successfully:', {
        applicationId: application.id,
        cvPath: filePath,
        originalFilename: cv_filename
      });

      return {
        success: true,
        message: "Job application submitted successfully",
        application: {
          id: application.id,
          job_id: application.job_id,
          applier_id: application.applier_id,
          status: application.status,
          cv_url: application.cv_url,
          cover_letter: application.cover_letter,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        }
      };
    } catch (dbError) {
      // Clean up file if database save failed
      if (savedFilePath && fs.existsSync(savedFilePath)) {
        try {
          fs.unlinkSync(savedFilePath);
          console.log('🗑️ Cleaned up file after database error:', savedFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      throw dbError;
    }

  } catch (error: any) {
    console.error('🚨 Application error:', error);
    throw error;
  }
}));

// ✅ UPDATED: Download CV endpoint - GANTI SELURUH FUNGSI INI
router.get("/download-cv/:applicationId", controllerWrapper(async (req, res) => {
  const authHeader = req.headers['authorization'];
  let token: string | undefined;
  let userId: string;

  if (authHeader && typeof authHeader === 'string') {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authorization token not provided"
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, appConfig.jwtSecret) as unknown as {
      id: string;
      email?: string;
      name?: string;
    };

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: "Invalid token structure"
      });
    }

    userId = decoded.id;
    const applicationId = req.params.applicationId;

    console.log('📥 Download CV request:', {
      userId,
      applicationId
    });

    // Find application with job details
    const application = await JobAppliers.findOne({
      where: { id: applicationId },
      include: [
        {
          model: JobPosts,
          as: "jobPost",
          attributes: ["recruiter_id", "title"]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found"
      });
    }

    console.log('📋 Application found:', {
      id: application.id,
      applier_id: application.applier_id,
      recruiter_id: application.jobPost?.recruiter_id,
      cv_url: application.cv_url
    });

    // Check if user is the applicant or the recruiter
    const applier = await Appliers.findOne({
      where: { applier_id: application.applier_id }
    });

    const isApplicant = applier?.applier_id === userId;
    const isRecruiter = application.jobPost?.recruiter_id === userId;

    console.log('🔐 Authorization check:', {
      isApplicant,
      isRecruiter,
      userId,
      applier_id: applier?.applier_id,
      recruiter_id: application.jobPost?.recruiter_id
    });

    if (!isApplicant && !isRecruiter) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: You can only access your own CV or CVs for your job posts"
      });
    }

    // Check if CV file exists
    if (!application.cv_url) {
      return res.status(404).json({
        success: false,
        error: "CV file path not found in database"
      });
    }

    const cvFilePath = application.cv_url as string;
    console.log('📄 Checking CV file:', cvFilePath);

    if (!fs.existsSync(cvFilePath)) {
      return res.status(404).json({
        success: false,
        error: "CV file not found on server"
      });
    }

    // Get file stats
    const stats = fs.statSync(cvFilePath);
    console.log('📊 File stats:', {
      path: cvFilePath,
      size: stats.size,
      exists: true
    });

    if (stats.size === 0) {
      return res.status(404).json({
        success: false,
        error: "CV file is empty"
      });
    }

    // Extract filename for download
    const originalFilename = path.basename(cvFilePath);
    const downloadFilename = `${applier?.name || 'applicant'}_CV.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');

    console.log('📥 Starting download:', {
      originalFilename,
      downloadFilename,
      fileSize: stats.size
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');

    // Create read stream and pipe to response
    const readStream = fs.createReadStream(cvFilePath);
    
    readStream.on('error', (error) => {
      console.error('📥 File read error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to read CV file"
        });
      }
    });

    readStream.on('end', () => {
      console.log('✅ CV download completed successfully');
    });

    // Pipe the file to the response
    readStream.pipe(res);

  } catch (error: any) {
    console.error('🚨 Download error:', error);
    
    if (!res.headersSent) {
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          error: "Invalid token"
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Internal server error during download"
        });
      }
    }
  }
}));

// ✅ NEW: Get all applications for a job (for recruiters)
router.get("/job/:jobId/applications", authMiddleware, controllerWrapper(async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobId = req.params.jobId;

    if (!userId) {
      throw new Error("Unauthorized: User ID not found");
    }

    // Check if user is the recruiter for this job
    const job = await JobPosts.findOne({
      where: { 
        job_id: jobId,
        recruiter_id: userId 
      }
    });

    if (!job) {
      throw new Error("Job not found or you don't have permission to view applications");
    }

    // Get all applications for this job
    const applications = await JobAppliers.findAll({
      where: { job_id: jobId },
      include: [
        {
          model: Appliers,
          as: "applier",
          attributes: ["applier_id", "name", "email"]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      success: true,
      applications: applications.map(app => ({
        id: app.id,
        applier: app.applier,
        status: app.status,
        cover_letter: app.cover_letter,
        appliedAt: app.createdAt,
        cv_available: app.cv_url ? fs.existsSync(app.cv_url as string) : false
      }))
    };

  } catch (error: any) {
    console.error('🚨 Get applications error:', error);
    throw error;
  }
}));

// ✅ NEW: Update application status (for recruiters)
router.patch("/applications/:applicationId/status", authMiddleware, controllerWrapper(async (req, res) => {
  try {
    const userId = req.user?.id;
    const applicationId = req.params.applicationId;
    const { status } = req.body;

    if (!userId) {
      throw new Error("Unauthorized: User ID not found");
    }

    if (!status || !['applied', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      throw new Error("Invalid status. Must be: applied, reviewed, accepted, or rejected");
    }

    // Find application and verify recruiter permission
    const application = await JobAppliers.findOne({
      where: { id: applicationId },
      include: [
        {
          model: JobPosts,
          as: "jobPost",
          where: { recruiter_id: userId }
        }
      ]
    });

    if (!application) {
      throw new Error("Application not found or you don't have permission to update it");
    }

    // Update status
    await application.update({ status });

    return {
      success: true,
      message: "Application status updated successfully",
      application: {
        id: application.id,
        status: application.status,
        updatedAt: application.updatedAt
      }
    };

  } catch (error: any) {
    console.error('🚨 Update status error:', error);
    throw error;
  }
}));

export default router;