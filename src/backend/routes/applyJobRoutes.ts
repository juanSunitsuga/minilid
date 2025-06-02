import express from "express";
import path from "path";
import fs from "fs";
import * as fsExtra from "fs-extra";
import { JobPosts } from "../../../models/job_posts";
import { Appliers } from "../../../models/appliers";
import { JobAppliers } from "../../../models/job_appliers";
import { Recruiters } from "../../../models/recruiters";
import { Companies } from "../../../models/companies";
import { JobCategories } from "../../../models/job_categories";
import { JobTypes } from "../../../models/job_types";
import authMiddleware from "../../middleware/Auth";
import { controllerWrapper } from "../../utils/controllerWrapper";
import jwt from "jsonwebtoken";
import { appConfig } from "../../../config/app";
import process from 'process';

const router = express.Router();

const serveFile = (filePath: string, res: express.Response): Promise<void> => {
  return new Promise((resolve, reject) => {
    res.sendFile(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Apply for a job
router.post("/apply", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const { job_id, cv_file, cv_filename, cv_type, cover_letter } = req.body;

    if (!userId) throw new Error("Unauthorized: User ID not found");
    if (!job_id) throw new Error("Job ID is required");
    if (!cv_file) throw new Error("CV file is required");
    if (!cv_filename) throw new Error("CV filename is required");
    if (!cv_type || cv_type !== 'application/pdf') throw new Error("Only PDF files are allowed");
    if (typeof cv_file !== 'string') throw new Error("Invalid CV file format");

    // Estimate file size from base64 (base64 is ~4/3 larger than original)
    const estimatedFileSize = (cv_file.length * 0.75);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (estimatedFileSize > maxFileSize) throw new Error(`File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`);

    // Find applier
    const applier = await Appliers.findOne({ where: { applier_id: userId } });
    if (!applier) throw new Error("Applier profile not found. Please complete your profile first.");

    // Check if job exists
    const job = await JobPosts.findByPk(job_id);
    if (!job) throw new Error("Job not found");

    // Check if already applied
    const existingApplication = await JobAppliers.findOne({
        where: { job_id: job_id, applier_id: applier.applier_id }
    });
    if (existingApplication) throw new Error("You have already applied for this job");

    // === MIMIC chatRoutes directory structure ===
    // Use project root for 'data/cv/<job_id>/'
    const PROJECT_ROOT = process.cwd();
    const CV_BASE_DIR = path.join(PROJECT_ROOT, 'data', 'cv', job_id);

    if (!fs.existsSync(CV_BASE_DIR)) fs.mkdirSync(CV_BASE_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(cv_filename) || '.pdf';
    const savedFileName = `${userId}_${timestamp}_cv${fileExtension}`;
    const filePath = path.join(CV_BASE_DIR, savedFileName);

    // Convert base64 to file and save
    let savedFilePath = null;
    try {
        const fileBuffer = Buffer.from(cv_file, 'base64');
        fs.writeFileSync(filePath, fileBuffer);
        savedFilePath = filePath;
    } catch (fileError) {
        if (savedFilePath && fs.existsSync(savedFilePath)) {
            try { fs.unlinkSync(savedFilePath); } catch { }
        }
        throw new Error("Failed to save CV file");
    }

    const application = await JobAppliers.create({
        job_id: job_id,
        applier_id: applier.applier_id,
        cv_url: filePath,
        status: 'applied',
        cover_letter: cover_letter || null
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

}));

// Download CV endpoint (refactored, no try/catch)
router.get("/download-cv/:applicationId", controllerWrapper(async (req, res) => {
    // Get token from Authorization header OR query parameter
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];
    const queryToken = req.query.token as string;
    const token = headerToken || queryToken;

    if (!token) {
        throw new Error("No token provided");
    }

    // Verify token
    const decoded = jwt.verify(token, appConfig.jwtSecret) as { id: string; email?: string; name?: string; };
    if (!decoded || !decoded.id) {
        throw new Error("Invalid token structure");
    }
    const userId = decoded.id;

    const applicationId = req.params.applicationId;

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
        throw new Error("Application not found");
    }

    // Check if user is the applicant or the recruiter
    const applier = await Appliers.findOne({ where: { applier_id: application.applier_id } });
    const isApplicant = applier?.applier_id === userId;
    const isRecruiter = application.jobPost?.recruiter_id === userId;

    if (!isApplicant && !isRecruiter) {
        throw new Error("Unauthorized: You can only access your own CV or CVs for your job posts");
    }

    // Check if CV file exists
    if (!application.cv_url) {
        throw new Error("CV file path not found in database");
    }

    const cvFilePath = application.cv_url as string;
    if (!await fsExtra.pathExists(cvFilePath)) {
        throw new Error("CV file not found on server");
    }

    const stats = fs.statSync(cvFilePath);
    if (stats.size === 0) {
        throw new Error("CV file is empty");
    }

    // Extract filename for download
    const originalFilename = path.basename(cvFilePath);
    const downloadFilename = `${applier?.name || 'applicant'}_CV.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');

    // Set proper content-type based on file extension
    const ext = path.extname(originalFilename).toLowerCase();
    if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(downloadFilename)}"`);
    } else {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"`);
    }
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');

    // Serve the file
    await serveFile(cvFilePath, res);
}));

// Get my job applications
router.get("/my-applications", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new Error("Unauthorized: User ID not found");
    }

    const applier = await Appliers.findOne({
        where: { applier_id: userId }
    });

    if (!applier) {
        throw new Error("Applier profile not found. Please complete your profile first.");
    }

    // Get all applications
    const applications = await JobAppliers.findAll({
        where: { applier_id: userId },
        include: [
            {
                model: JobPosts,
                as: "jobPost",
                include: [
                    {
                        model: Recruiters,
                        as: "recruiter",
                        include: [
                            {
                                model: Companies,
                                as: "company"
                            }
                        ]
                    }
                ],
                attributes: ["job_id", "title", "description", "posted_date"]
            }
        ]
    });

    return {
        message: "Job applications retrieved successfully",
        data: applications
    }
}));

// Cancel job application
router.delete("/cancel/:applicationId", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const applicationId = req.params.applicationId;

    if (!userId) {
        throw new Error("Unauthorized: User ID not found");
    }

    // Find applier
    const applier = await Recruiters.findOne({
        where: { recruiter_id: userId }
    });

    if (!applier) {
        throw new Error("Recruiter profile not found");
    }

    // Find application
    const application = await JobAppliers.findOne({
        where: {
            id: applicationId,
            status: ['interviewing', 'rejected'], // Allow cancellation if status is either 'interviewing' or 'rejected'
        }
    });

    if (!application) {
        throw new Error("Application not found or cannot be cancelled");
    }

    // Delete the application
    await application.destroy();

    return {
        message: "Job application finished!"
    };
}));

router.get('/job-applicants', authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new Error("Unauthorized: User ID not found");
    }

    // Find recruiter
    const recruiter = await Recruiters.findOne({
        where: { recruiter_id: userId }
    });

    console.log(0, recruiter)

    if (!recruiter) {
        throw new Error("Unauthorized: Recruiter not found");
    }

    const company = await Companies.findOne({
        where: { company_id: recruiter.company_id }
    });

    // Find all jobs posted by this recruiter
    const jobs = await JobPosts.findAll({
        where: { recruiter_id: recruiter.recruiter_id },
        order: [["posted_date", "DESC"]]
    });

    if (!jobs || jobs.length === 0) {
        return {
            message: "No jobs found for this recruiter",
            data: []
        };
    }

    const category = await JobCategories.findAll();
    const type = await JobTypes.findAll();



    // Get applicant counts for each job
    const jobsWithApplicantCounts = await Promise.all(jobs.map(async job => {
        const applicantCount = await JobAppliers.count({
            where: { job_id: job.job_id }
        });

        const jobData = job.get({ plain: true });

        const matchingCategory = category.find(c => c.category_id === jobData.category_id);

        const matchingType = type.find(t => t.type_id === jobData.type_id);

        return {
            job_id: jobData.job_id,
            title: jobData.title,
            description: jobData.description,
            posted_date: jobData.posted_date,
            category: matchingCategory ? {
                name: matchingCategory.category
            } : null,
            type: matchingType ? {
                name: matchingType.type,
            } : null,
            company: company ? {
                name: company.company_name, 
                address: company.address
            } : null,
            applicants_count: applicantCount
        };
    }));

    return {
        message: "Jobs with applicant counts retrieved successfully",
        data: jobsWithApplicantCounts
    };
}));


// Get all applications for a job (for recruiters)
router.get("/job/:jobId/applications", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const jobId = req.params.jobId;

    if (!userId) throw new Error("Unauthorized: User ID not found");

    // Check if user is the recruiter for this job
    const job = await JobPosts.findOne({
        where: { job_id: jobId, recruiter_id: userId }
    });

    if (!job) throw new Error("Job not found or you don't have permission to view applications");

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
}));

// Update application status (for recruiters)
router.patch("/applications/:applicationId/status", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const applicationId = req.params.applicationId;
    const { status } = req.body;

    if (!userId) throw new Error("Unauthorized: User ID not found");


    if (!status || !['applied', 'interviewing', 'rejected'].includes(status)) {
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

    if (!application) throw new Error("Application not found or you don't have permission to update it");

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
}));

export default router;