import express from "express";
import bcrypt from 'bcrypt'; // Move bcrypt import to the top
import { Appliers } from "../../../models/appliers";
import { Recruiters } from "../../../models/recruiters";
import { Skills } from "../../../models/skills";
import { Experiences } from "../../../models/experiences";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";
import { ApplierSkill } from "../../../models/applier_skill";
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

// Update your Skill interface to match the actual Skills model
interface Skill {
    skill_id: number;  // Changed from string to number to match the model
    name: string;
}

// =============================================
// APPLIER PROFILE ROUTES
// =============================================

/**
 * GET /api/profile/appliers
 * Get applier profile by query parameter
 * Used for: Fetching applier profile information using applier_id as query param
 */
router.get("/appliers", controllerWrapper(async (req, res) => {
    const applierId = req.query.applier_id;
    if (!applierId) {
        throw new Error("Applier ID is required.");
    }

    const applier = await Appliers.findOne({
        where: { user_id: applierId },
    });

    if (!applier) {
        throw new Error("Applier not found.");
    }

    return {
        message: "Applier profile retrieved successfully.",
        data: applier,
    }
}));

/**
 * GET /api/profile/appliers/:id
 * Get specific applier profile by ID parameter
 * Used for: Fetching detailed applier profile information
 */
router.get("/appliers/:id", controllerWrapper(async (req, res) => {
    const applierId = req.params.id;
    if (!applierId) {
        throw new Error("Applier ID is required.");
    }

    const applier = await Appliers.findOne({
        where: { applier_id: applierId },
        // Note: Skills and experiences associations are commented out
        // Uncomment to include related data:
        include: [
            {
                model: Skills,
                as: "skills",
                attributes: ["skill_id", "name"],
                through: { attributes: [] },
            },
            {
                model: Experiences,
                as: "experiences",
                attributes: ["experience_id", "company_name", "start_date", "end_date"],
            },
        ],
    });

    if (!applier) {
        throw new Error("Applier not found.");
    }

    return {
        message: "Applier profile retrieved successfully.",
        data: applier,
    }
}));

/**
 * POST /api/profile/appliers/:id/about
 * Update applier's about section
 * Used for: Updating the about/bio information for an applier
 * Requires: Authentication
 */
router.post("/appliers/:id/about", authMiddleware, controllerWrapper(async (req, res) => {
    const applierId = req.params.id;
    const { about } = req.body;

    if (!applierId || !about) {
        throw new Error("Applier ID and about information are required.");
    }

    // Ensure the authenticated user is updating their own profile
    if (req.user && req.user.id !== applierId) {
        throw new Error("You are not authorized to update this profile.");
    }

    const applier = await Appliers.findOne({
        where: { applier_id: applierId }
    });

    if (!applier) {
        throw new Error("Applier profile not found.");
    }

    // Update the about field
    applier.about = about;
    
    // Save the updated profile
    await applier.save();

    return {
        message: "Applier about information updated successfully.",
        data: applier,
    };
}));

/**
 * PUT /api/profile/appliers/:id
 * Update applier profile information
 * Used for: Updating applier's basic profile data (name, email, password)
 * Requires: Authentication, user can only update their own profile
 */
router.put("/appliers/:id", authMiddleware, controllerWrapper(async (req, res) => {
    const applierId = req.params.id;
    
    // Ensure the authenticated user is updating their own profile
    if (req.user && req.user.id !== applierId) {
        throw new Error("You are not authorized to update this profile.");
    }
    
    const {
        name,
        email,
        password,
        currentPassword
    } = req.body;

    // Find the applier
    const applier = await Appliers.findOne({
        where: { applier_id: applierId }
    });

    if (!applier) {
        throw new Error("Applier profile not found.");
    }

    // Always require current password for any changes
    if (!currentPassword) {
        throw new Error("Current password is required for profile updates.");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, applier.password);
    if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect.");
    }

    // If password is being updated, hash the new password
    if (password) {
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(password, saltRounds);
        applier.password = hashedNewPassword;
    }

    // Update fields if they are provided
    if (name !== undefined) applier.name = name;
    if (email !== undefined) applier.email = email;
    
    // Save the updated profile
    await applier.save();

    // Return updated applier without the password
    const { password: _, ...applierData } = applier.get({ plain: true });

    return {
        message: "Applier profile updated successfully.",
        data: applierData
    };
}));

/**
 * PUT /api/profile/recruiters/:id
 * Update recruiter profile information
 * Used for: Updating recruiter's basic profile data (name, email, password)
 * Requires: Authentication, user can only update their own profile
 */
router.put("/recruiters/:id", authMiddleware, controllerWrapper(async (req, res) => {
    const recruiterId = req.params.id;
    
    // Ensure the authenticated user is updating their own profile
    if (req.user && req.user.id !== recruiterId) {
        throw new Error("You are not authorized to update this profile.");
    }
    
    const {
        name,
        email,
        password,
        currentPassword
    } = req.body;

    // Find the recruiter
    const recruiter = await Recruiters.findOne({
        where: { recruiter_id: recruiterId }
    });

    if (!recruiter) {
        throw new Error("Recruiter profile not found.");
    }

    // Always require current password for any changes
    if (!currentPassword) {
        throw new Error("Current password is required for profile updates.");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, recruiter.password);
    if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect.");
    }

    // If password is being updated, hash the new password
    if (password) {
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(password, saltRounds);
        recruiter.password = hashedNewPassword;
    }

    // Update fields if they are provided
    if (name !== undefined) recruiter.name = name;
    if (email !== undefined) recruiter.email = email;
    
    // Save the updated profile
    await recruiter.save();

    // Return updated recruiter without the password
    const { password: _, ...recruiterData } = recruiter.get({ plain: true });

    return {
        message: "Recruiter profile updated successfully.",
        data: recruiterData
    };
}));

// =============================================
// SKILLS MANAGEMENT ROUTES
// =============================================

/**
 * GET /api/profile/appliers-skills
 * Get all skills for the authenticated applier or a specific applier by query
 * Used for: Retrieving an applier's skill list for profile display
 * Query parameter: applier_id (optional - if not provided, uses authenticated user)
 * Requires: Authentication for fetching own skills, public for viewing others
 */
router.get("/appliers-skills", controllerWrapper(async (req, res) => {
    const queryApplierId = req.query.applier_id as string;
    
    // If no applier_id in query, this should be an authenticated request for own skills
    if (!queryApplierId) {
        // This would require authentication middleware
        throw new Error("Applier ID is required as query parameter.");
    }

    console.log('Fetching skills for applier:', queryApplierId);

    // Find the applier with their skills
    const applier = await Appliers.findOne({
        where: { applier_id: queryApplierId },
        include: [
            {
                model: Skills,
                as: "skills",
                attributes: ["skill_id", "name"],
                through: { attributes: [] }, // This excludes junction table attributes
            },
        ],
    });
    
    if (!applier) {
        throw new Error("Applier not found.");
    }
    
    // Format skills data to match expected structure
    const skills = applier.skills ? applier.skills.map((skill: any) => ({
        skill_id: skill.skill_id,
        name: skill.name,
    })) : [];
    
    console.log('Found skills:', skills.length);
    
    return {
        message: "Skills retrieved successfully.",
        data: skills,
    };
}));

/**
 * GET /api/profile/appliers-skills/me
 * Get skills for the authenticated applier (alternative endpoint)
 * Used for: Retrieving authenticated user's own skills
 * Requires: Authentication
 */
router.get("/appliers-skills/me", authMiddleware, controllerWrapper(async (req, res) => {
    const applierId = req.user?.id;

    if (!applierId) {
        throw new Error("User authentication required.");
    }

    if (req.user?.userType !== "applier") {
        throw new Error("Only appliers can access this endpoint.");
    }

    console.log('Fetching skills for authenticated applier:', applierId);

    // Find the applier with their skills
    const applier = await Appliers.findOne({
        where: { applier_id: applierId },
        include: [
            {
                model: Skills,
                as: "skills",
                attributes: ["skill_id", "name"],
                through: { attributes: [] },
            },
        ],
    });
    
    if (!applier) {
        throw new Error("Applier profile not found.");
    }
    
    // Format skills data
    const skills = applier.skills ? applier.skills.map((skill: any) => ({
        skill_id: skill.skill_id,
        name: skill.name,
    })) : [];
    
    console.log('Found skills for authenticated user:', skills.length);
    
    return {
        message: "Your skills retrieved successfully.",
        data: skills,
    };
}));

/**
 * POST /api/profile/appliers-skills
 * Add new skills to an applier's profile
 * Used for: Adding/updating skills for an applier
 * Requires: Authentication
 * Body: { applier_id, skills: string[] }
 * Note: Creates new skills if they don't exist, links existing ones
 */
router.post("/appliers-skills", authMiddleware, controllerWrapper(async (req, res) => {
    const { applier_id, skills } = req.body;

    if (!applier_id || !skills) {
        throw new Error("Applier ID and skills are required.");
    }

    const applier = await Appliers.findByPk(applier_id);
    if (!applier) {
        throw new Error("Applier not found.");
    }

    // Get existing skills for the applier
    const applierWithSkills = await Appliers.findOne({
        where: { applier_id: applier_id },
        include: [{
            model: Skills,
            as: "skills",
            attributes: ["skill_id", "name"],
            through: { attributes: [] }
        }]
    });

    const existingSkills = applierWithSkills?.skills || [] as Skill[];
    const existingSkillNames = existingSkills.map((skill: Skill) => skill.name);

    // Filter out skills that already exist
    const newSkillNames = skills.filter((skill: any) => !existingSkillNames.includes(skill));

    // Create new skills if they don't exist in the Skills table
    const newSkillInstances = await Promise.all(
        newSkillNames.map(async (skillName: string) => {
            const [skillInstance] = await Skills.findOrCreate({
                where: { name: skillName },
                defaults: {
                    skill_id: v4(),
                    name: skillName
                }
            });
            return skillInstance;
        })
    );

    const allSkillInstances = [
        ...existingSkills,
        ...newSkillInstances
    ];

    // Create associations in ApplierSkill junction table
    await Promise.all(
        newSkillInstances.map(async (skill) => {
            await ApplierSkill.create({
                applier_id: applier_id,
                skill_id: skill.skill_id
            });
        })
    );

    return {
        message: "Skills updated in applier profile successfully.",
        data: allSkillInstances,
    };
}));


// =============================================
// EXPERIENCE MANAGEMENT ROUTES
// =============================================

// /**
//  * POST /api/profile/experiences
//  * Add new work experience
//  * Used for: Creating new work experience entries for appliers or recruiters
//  * Requires: Authentication
//  * Body: { user_type, user_id, company_name, job_title, start_date, end_date?, description? }
//  */
// router.post("/experiences", authMiddleware, controllerWrapper(async (req, res) => {
//     const { 
//         user_type, 
//         user_id, 
//         company_name, 
//         job_title, 
//         start_date, 
//         end_date, 
//         description 
//     } = req.body;

//     if (!user_type || !user_id || !company_name || !job_title || !start_date) {
//         throw new Error("User type, user ID, company name, job title, and start date are required.");
//     }

//     if (user_type !== 'applier' && user_type !== 'recruiter') {
//         throw new Error("User type must be either 'applier' or 'recruiter'.");
//     }

//     // Verify user exists
//     let user;
//     if (user_type === 'applier') {
//         user = await Appliers.findOne({ where: { user_id } });
//     } else {
//         user = await Recruiters.findOne({ where: { user_id } });
//     }

//     if (!user) {
//         throw new Error(`${user_type.charAt(0).toUpperCase() + user_type.slice(1)} not found.`);
//     }

//     const experience = await Experiences.create({
//         experience_id: v4(),
//         user_id,
//         user_type,
//         company_name,
//         job_title,
//         start_date: new Date(start_date),
//         end_date: end_date ? new Date(end_date) : null,
//         description: description || null
//     });

//     return {
//         status: 'success',
//         message: "Experience added successfully.",
//         data: experience
//     };
// }));

// /**
//  * GET /api/profile/experiences
//  * Get all experiences for a specific user
//  * Used for: Retrieving work experience history for profile display
//  * Query parameters: user_type, user_id
//  * Returns: Experiences ordered by start_date (most recent first)
//  */
// router.get("/experiences", controllerWrapper(async (req, res) => {
//     const { user_type, user_id } = req.query;

//     if (!user_type || !user_id) {
//         throw new Error("User type and user ID are required.");
//     }

//     if (user_type !== 'applier' && user_type !== 'recruiter') {
//         throw new Error("User type must be either 'applier' or 'recruiter'.");
//     }

//     const experiences = await Experiences.findAll({
//         where: {
//             user_id,
//             user_type
//         },
//         order: [
//             ['start_date', 'DESC'] // Most recent experience first
//         ]
//     });

//     return {
//         message: "Experiences retrieved successfully.",
//         data: experiences
//     };
// }));

// /**
//  * PUT /api/profile/experiences/:experience_id
//  * Update existing work experience
//  * Used for: Editing work experience entries
//  * Body: { company_name?, job_title?, start_date?, end_date?, description? }
//  */
// router.put("/experiences/:experience_id", controllerWrapper(async (req, res) => {
//     const { experience_id } = req.params;
//     const { 
//         company_name, 
//         job_title, 
//         start_date, 
//         end_date, 
//         description 
//     } = req.body;

//     const experience = await Experiences.findByPk(experience_id);
    
//     if (!experience) {
//         throw new Error("Experience not found.");
//     }

//     // Update only provided fields
//     if (company_name) experience.company_name = company_name;
//     if (job_title) experience.job_title = job_title; 
//     if (start_date) experience.start_date = new Date(start_date);
//     if (end_date !== undefined) experience.end_date = end_date ? new Date(end_date) : null;
//     if (description !== undefined) experience.description = description;

//     await experience.save();

//     return {
//         message: "Experience updated successfully.",
//         data: experience
//     };
// }));

// /**
//  * DELETE /api/profile/experiences/:experience_id
//  * Delete work experience entry
//  * Used for: Removing work experience from profile
//  */
// router.delete("/experiences/:experience_id", controllerWrapper(async (req, res) => {
//     const { experience_id } = req.params;

//     const experience = await Experiences.findByPk(experience_id);
    
//     if (!experience) {
//         throw new Error("Experience not found.");
//     }

//     await experience.destroy();

//     return {
//         message: "Experience deleted successfully."
//     };
// }));

export default router;