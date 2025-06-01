import express from "express";
import { JobPosts } from "../../../models/job_posts";
import { Appliers } from "../../../models/appliers";
import { JobAppliers } from "../../../models/job_appliers";
import { Recruiters } from "../../../models/recruiters";
import { Companies } from "../../../models/companies";
import { JobCategories } from "../../../models/job_categories";
import { JobTypes } from "../../../models/job_types";
import authMiddleware from "../../middleware/Auth";
import { controllerWrapper } from "../../utils/controllerWrapper";

const router = express.Router();

// Apply for a job
router.post("/apply", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    const { job_id } = req.body;

    if (!userId) {
        throw new Error("Unauthorized: User ID not found");
    }

    if (!job_id) {
        throw new Error("Job ID is required");
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

    // Create job application
    const application = await JobAppliers.create({
        job_id: job_id,
        applier_id: applier.applier_id,
        status: 'applied'
    });

    // Just return data, don't use res.json()
    return {
        message: "Job application submitted successfully",
        application: application.toJSON()
    };
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
    const applier = await Appliers.findOne({
        where: { user_id: userId }
    });

    if (!applier) {
        throw new Error("Applier profile not found");
    }

    // Find application
    const application = await JobAppliers.findOne({
        where: {
            id: applicationId,
            applier_id: applier.applier_id,
            // Only allow cancellation if status is 'applied'
            status: 'applied'
        }
    });

    if (!application) {
        throw new Error("Application not found or cannot be cancelled");
    }

    // Delete the application
    await application.destroy();

    return {
        message: "Job application cancelled successfully"
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
                name: matchingCategory.category_name 
            } : null,
            type: matchingType ? {
                name: matchingType.type_name,
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

router.put("/response/:id", authMiddleware, controllerWrapper(async (req, res) => {
    const id = req.params.id;
    const response = req.body;

    const job_applier = await JobAppliers.findOne({
        where: {
            id: id,
        }
    });

    if (!job_applier) {
        res.locals.errorCode = 404;
        throw new Error("Applier for Job not found");
    }

    if (response) {
        job_applier.status = "interviewing";
    }
    else {
        job_applier.status = "rejected";
    }

    job_applier.save();

    return {
        message: "Job application submitted successfully",
        data: job_applier
    };
}));


export default router;