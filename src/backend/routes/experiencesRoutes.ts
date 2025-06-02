import express from "express";
import { Appliers } from "../../../models/appliers";
import { Recruiters } from "../../../models/recruiters";
import { Experiences } from "../../../models/experiences";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";
import { v4 } from "uuid";

const router = express.Router();

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                userType: "applier" | "recruiter",
            };
            uploadedFile?: { filename: string };
        }
    }
}

// =============================================
// APPLIER EXPERIENCE ROUTES
// =============================================

/**
 * GET /api/experiences/appliers-experiences
 * Get all experiences for a specific applier
 * Used for: Retrieving an applier's experience list for profile display
 * Query parameter: applier_id
 * Following the same pattern as appliers-skills route
 */
router.get("/appliers-experiences", controllerWrapper(async (req, res) => {
    const applierId = req.query.applier_id;

    console.log('Fetching experiences for applier:', applierId);

    if (!applierId) {
        throw new Error("Applier ID is required.");
    }

    // Now we can use include since associations are properly set up
    const applier = await Appliers.findOne({
        where: { applier_id: applierId },
        include: [
            {
                model: Experiences,
                as: "experiences",
                attributes: ["experience_id", "company_name", "job_title", "start_date", "end_date", "description"],
                required: false // LEFT JOIN
            }
        ]
    });

    if (!applier) {
        throw new Error("Applier not found.");
    }

    // Extract and format experiences
    const experiences = applier.experiences?.map((exp: any) => ({
        experience_id: exp.experience_id,
        company_name: exp.company_name,
        job_title: exp.job_title,
        start_date: exp.start_date,
        end_date: exp.end_date,
        description: exp.description
    })) || [];

    // Sort by start_date (most recent first)
    experiences.sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    console.log('Found experiences:', experiences.length);

    return {
        message: "Experiences retrieved successfully.",
        data: experiences
    };
}));

/**
 * POST /api/experiences/appliers-experiences
 * Add new experience to an applier's profile
 * Used for: Adding new work experience for an applier
 * Requires: Authentication
 * Body: { applier_id, company_name, job_title, start_date, end_date?, description? }
 */
router.post("/appliers-experiences", authMiddleware, controllerWrapper(async (req, res) => {
    const { 
        applier_id, 
        company_name, 
        job_title, 
        start_date, 
        end_date, 
        description 
    } = req.body;

    console.log('Received experience data:', req.body);
    console.log('Authenticated user:', req.user);

    if (!applier_id || !company_name || !job_title || !start_date) {
        throw new Error("Applier ID, company name, job title, and start date are required.");
    }

    // Ensure the authenticated user is creating experience for themselves
    if (req.user && req.user.id !== applier_id) {
        throw new Error("You can only create experiences for your own profile.");
    }

    // Verify applier exists
    const applier = await Appliers.findOne({ where: { applier_id } });

    if (!applier) {
        throw new Error("Applier not found.");
    }

    // Create the experience
    const experience = await Experiences.create({
        experience_id: v4(),
        user_id: applier_id,
        user_type: 'applier',
        company_name,
        job_title,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        description: description || null
    });

    console.log('Created experience:', experience.toJSON());

    return {
        status: 'success',
        message: "Experience added successfully.",
        data: experience.toJSON()
    };
}));

/**
 * PUT /api/experiences/appliers-experiences/:experience_id
 * Update existing work experience for an applier
 * Used for: Editing work experience entries
 * Requires: Authentication
 * Body: { company_name?, job_title?, start_date?, end_date?, description? }
 */
router.put("/appliers-experiences/:experience_id", authMiddleware, controllerWrapper(async (req, res) => {
    const { experience_id } = req.params;
    const { 
        company_name, 
        job_title, 
        start_date, 
        end_date, 
        description 
    } = req.body;

    console.log('Updating experience:', experience_id, req.body);
    console.log('Authenticated user:', req.user);

    const experience = await Experiences.findOne({
        where: { 
            experience_id,
            user_type: 'applier'
        }
    });
    
    if (!experience) {
        throw new Error("Experience not found.");
    }

    // Ensure the authenticated user owns this experience
    if (req.user && req.user.id !== experience.user_id) {
        throw new Error("You can only update your own experiences.");
    }

    // Validate the applier still exists
    const applier = await Appliers.findOne({ where: { applier_id: experience.user_id } });

    if (!applier) {
        throw new Error("Associated applier not found.");
    }

    // Update only provided fields with proper validation
    const updates: any = {};
    
    if (company_name !== undefined) {
        if (!company_name.trim()) {
            throw new Error("Company name cannot be empty.");
        }
        updates.company_name = company_name.trim();
    }
    
    if (job_title !== undefined) {
        if (!job_title.trim()) {
            throw new Error("Job title cannot be empty.");
        }
        updates.job_title = job_title.trim();
    }
    
    if (start_date !== undefined) {
        const startDateObj = new Date(start_date);
        if (isNaN(startDateObj.getTime())) {
            throw new Error("Invalid start date.");
        }
        updates.start_date = startDateObj;
    }
    
    if (end_date !== undefined) {
        if (end_date === null || end_date === '') {
            updates.end_date = null;
        } else {
            const endDateObj = new Date(end_date);
            if (isNaN(endDateObj.getTime())) {
                throw new Error("Invalid end date.");
            }
            // Check if end date is after start date
            const startDateToCheck = updates.start_date || experience.start_date;
            if (endDateObj <= startDateToCheck) {
                throw new Error("End date must be after start date.");
            }
            updates.end_date = endDateObj;
        }
    }
    
    if (description !== undefined) {
        updates.description = description ? description.trim() : null;
    }

    // Apply updates
    await experience.update(updates);

    // Reload to get fresh data
    await experience.reload();

    console.log('Updated experience:', experience.toJSON());

    return {
        message: "Experience updated successfully.",
        data: experience.toJSON()
    };
}));

/**
 * DELETE /api/experiences/appliers-experiences/:experience_id
 * Delete work experience entry for an applier
 * Used for: Removing work experience from applier profile
 * Requires: Authentication
 */
router.delete("/appliers-experiences/:experience_id", authMiddleware, controllerWrapper(async (req, res) => {
    const { experience_id } = req.params;

    console.log('Deleting experience:', experience_id);
    console.log('Authenticated user:', req.user);

    const experience = await Experiences.findOne({
        where: { 
            experience_id,
            user_type: 'applier'
        }
    });
    
    if (!experience) {
        throw new Error("Experience not found.");
    }

    // Ensure the authenticated user owns this experience
    if (req.user && req.user.id !== experience.user_id) {
        throw new Error("You can only delete your own experiences.");
    }

    // Verify the applier still exists
    const applier = await Appliers.findOne({ where: { applier_id: experience.user_id } });

    if (!applier) {
        throw new Error("Associated applier not found.");
    }

    // Store experience data for response (before deletion)
    const deletedExperienceData = experience.toJSON();

    await experience.destroy();

    console.log('Deleted experience successfully:', deletedExperienceData.experience_id);

    return {
        message: "Experience deleted successfully.",
        data: {
            deleted_experience_id: deletedExperienceData.experience_id,
            deleted_at: new Date().toISOString()
        }
    };
}));

// =============================================
// RECRUITER EXPERIENCE ROUTES
// =============================================

/**
 * GET /api/experiences/recruiters-experiences
 * Get all experiences for a specific recruiter
 * Used for: Retrieving a recruiter's experience list for profile display
 * Query parameter: recruiter_id
 */
router.get("/recruiters-experiences", controllerWrapper(async (req, res) => {
    const recruiterId = req.query.recruiter_id;

    if (!recruiterId) {
        throw new Error("Recruiter ID is required.");
    }

    const recruiter = await Recruiters.findOne({
        where: { recruiter_id: recruiterId },
        include: [
            {
                model: Experiences,
                as: "experiences",
                attributes: ["experience_id", "company_name", "job_title", "start_date", "end_date", "description"],
                where: { user_type: 'recruiter' },
                required: false
            }
        ]
    });

    if (!recruiter) {
        throw new Error("Recruiter not found.");
    }

    const experiences = recruiter.experiences?.map((exp: any) => ({
        experience_id: exp.experience_id,
        company_name: exp.company_name,
        job_title: exp.job_title,
        start_date: exp.start_date,
        end_date: exp.end_date,
        description: exp.description
    })) || [];

    experiences.sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    return {
        message: "Experiences retrieved successfully.",
        data: experiences
    };
}));

/**
 * POST /api/experiences/recruiters-experiences
 * Add new experience to a recruiter's profile
 * Used for: Adding new work experience for a recruiter
 * Requires: Authentication
 * Body: { recruiter_id, company_name, job_title, start_date, end_date?, description? }
 */
router.post("/recruiters-experiences", authMiddleware, controllerWrapper(async (req, res) => {
    const { 
        recruiter_id, 
        company_name, 
        job_title, 
        start_date, 
        end_date, 
        description 
    } = req.body;

    if (!recruiter_id || !company_name || !job_title || !start_date) {
        throw new Error("Recruiter ID, company name, job title, and start date are required.");
    }

    // Ensure the authenticated user is creating experience for themselves
    if (req.user && req.user.id !== recruiter_id) {
        throw new Error("You can only create experiences for your own profile.");
    }

    // Verify recruiter exists
    const recruiter = await Recruiters.findOne({ where: { recruiter_id } });

    if (!recruiter) {
        throw new Error("Recruiter not found.");
    }

    // Create the experience
    const experience = await Experiences.create({
        experience_id: v4(),
        user_id: recruiter_id,
        user_type: 'recruiter',
        company_name,
        job_title,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        description: description || null
    });

    return {
        status: 'success',
        message: "Experience added successfully.",
        data: experience.toJSON()
    };
}));

/**
 * PUT /api/experiences/recruiters-experiences/:experience_id
 * Update existing work experience for a recruiter
 */
router.put("/recruiters-experiences/:experience_id", authMiddleware, controllerWrapper(async (req, res) => {
    const { experience_id } = req.params;
    const { 
        company_name, 
        job_title, 
        start_date, 
        end_date, 
        description 
    } = req.body;

    const experience = await Experiences.findOne({
        where: { 
            experience_id,
            user_type: 'recruiter'
        }
    });
    
    if (!experience) {
        throw new Error("Experience not found.");
    }

    // Ensure the authenticated user owns this experience
    if (req.user && req.user.id !== experience.user_id) {
        throw new Error("You can only update your own experiences.");
    }

    // Validate the recruiter still exists
    const recruiter = await Recruiters.findOne({ where: { recruiter_id: experience.user_id } });

    if (!recruiter) {
        throw new Error("Associated recruiter not found.");
    }

    // Update only provided fields with proper validation
    const updates: any = {};
    
    if (company_name !== undefined) {
        if (!company_name.trim()) {
            throw new Error("Company name cannot be empty.");
        }
        updates.company_name = company_name.trim();
    }
    
    if (job_title !== undefined) {
        if (!job_title.trim()) {
            throw new Error("Job title cannot be empty.");
        }
        updates.job_title = job_title.trim();
    }
    
    if (start_date !== undefined) {
        const startDateObj = new Date(start_date);
        if (isNaN(startDateObj.getTime())) {
            throw new Error("Invalid start date.");
        }
        updates.start_date = startDateObj;
    }
    
    if (end_date !== undefined) {
        if (end_date === null || end_date === '') {
            updates.end_date = null;
        } else {
            const endDateObj = new Date(end_date);
            if (isNaN(endDateObj.getTime())) {
                throw new Error("Invalid end date.");
            }
            const startDateToCheck = updates.start_date || experience.start_date;
            if (endDateObj <= startDateToCheck) {
                throw new Error("End date must be after start date.");
            }
            updates.end_date = endDateObj;
        }
    }
    
    if (description !== undefined) {
        updates.description = description ? description.trim() : null;
    }

    // Apply updates
    await experience.update(updates);
    await experience.reload();

    return {
        message: "Experience updated successfully.",
        data: experience.toJSON()
    };
}));

/**
 * DELETE /api/experiences/recruiters-experiences/:experience_id
 * Delete work experience entry for a recruiter
 */
router.delete("/recruiters-experiences/:experience_id", authMiddleware, controllerWrapper(async (req, res) => {
    const { experience_id } = req.params;

    const experience = await Experiences.findOne({
        where: { 
            experience_id,
            user_type: 'recruiter'
        }
    });
    
    if (!experience) {
        throw new Error("Experience not found.");
    }

    // Ensure the authenticated user owns this experience
    if (req.user && req.user.id !== experience.user_id) {
        throw new Error("You can only delete your own experiences.");
    }

    // Verify the recruiter still exists
    const recruiter = await Recruiters.findOne({ where: { recruiter_id: experience.user_id } });

    if (!recruiter) {
        throw new Error("Associated recruiter not found.");
    }

    const deletedExperienceData = experience.toJSON();
    await experience.destroy();

    return {
        message: "Experience deleted successfully.",
        data: {
            deleted_experience_id: deletedExperienceData.experience_id,
            deleted_at: new Date().toISOString()
        }
    };
}));

// =============================================
// EXPERIENCE STATISTICS ROUTES
// =============================================

/**
 * GET /api/experiences/appliers-stats/:applier_id
 * Get experience statistics for an applier
 */
router.get("/appliers-stats/:applier_id", controllerWrapper(async (req, res) => {
    const { applier_id } = req.params;

    const applier = await Appliers.findOne({ where: { applier_id } });

    if (!applier) {
        throw new Error("Applier not found.");
    }

    const experiences = await Experiences.findAll({
        where: {
            user_id: applier_id,
            user_type: 'applier'
        },
        order: [['start_date', 'DESC']]
    });

    // Calculate statistics
    const totalExperiences = experiences.length;
    const currentExperiences = experiences.filter(exp => !exp.end_date).length;
    const pastExperiences = experiences.filter(exp => exp.end_date).length;

    // Calculate total experience duration
    let totalMonths = 0;
    experiences.forEach(exp => {
        const start = new Date(exp.start_date);
        const end = exp.end_date ? new Date(exp.end_date) : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += months;
    });

    const totalYears = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    const companies = [...new Set(experiences.map(exp => exp.company_name))];
    const jobTitles = [...new Set(experiences.map(exp => exp.job_title))];

    return {
        message: "Experience statistics retrieved successfully.",
        data: {
            total_experiences: totalExperiences,
            current_experiences: currentExperiences,
            past_experiences: pastExperiences,
            total_experience_duration: {
                years: totalYears,
                months: remainingMonths,
                total_months: totalMonths
            },
            companies_count: companies.length,
            companies: companies,
            job_titles_count: jobTitles.length,
            job_titles: jobTitles,
            experiences: experiences.map(exp => exp.toJSON())
        }
    };
}));

export default router;