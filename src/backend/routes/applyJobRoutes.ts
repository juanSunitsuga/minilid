import express from "express";
import { JobPosts } from "../../../models/job_posts";
import { Appliers } from "../../../models/appliers";
import { JobAppliers } from "../../../models/job_appliers";
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

    // Find applier
    const applier = await Appliers.findOne({
        where: { user_id: userId }
    });

    if (!applier) {
        throw new Error("Applier profile not found");
    }

    // Get all applications
    const applications = await JobAppliers.findAll({
        where: { applier_id: applier.applier_id },
        include: [
            {
                model: JobPosts,
                as: "jobPost",
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