import express from "express";
import { Appliers } from "../../../models/appliers";
import { Recruiters } from "../../../models/recruiters";
import { Skills } from "../../../models/skills";
import { Experiences } from "../../../models/experiences";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";
import { ApplierSkill } from "../../../models/applier_skills";
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

router.put("/appliers/:id/about", authMiddleware, controllerWrapper(async (req, res) => {
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

router.get("/appliers/:id", controllerWrapper(async (req, res) => {
    const applierId = req.params.id;
    if (!applierId) {
        throw new Error("Applier ID is required.");
    }

    const applier = await Appliers.findOne({
        where: { applier_id: applierId }
        // include: [
            // {
            //     model: Skills,
            //     as: "skills",
            //     attributes: ["skill_id", "name"],
            //     through: { attributes: [] },
            // },
            // {
            //     model: Experiences,
            //     as: "experiences",
            //     attributes: ["experience_id", "company_name", "start_date", "end_date"],
            // },
        // ],
    });

    if (!applier) {
        throw new Error("Applier not found.");
    }

    return {
        message: "Applier profile retrieved successfully.",
        data: applier,
    }
}));

router.get("/recruiters/:id", authMiddleware, controllerWrapper(async (req, res) => {
    const userId = req.user?.id;
    
    if (!userId) {
        throw new Error("Unauthorized: User ID not found.");
    }


    const recruiter = await Recruiters.findOne({
        where: { recruiter_id: userId }
    });

    if (!recruiter) {
        throw new Error("Recruiter not found.");
    }

    // Remove password from response for security
    const { password, ...recruiterData } = recruiter.get({ plain: true });

    return {
        message: "Recruiter profile retrieved successfully.",
        data: recruiterData
    };
}));

router

// Update the skills endpoint
router.get("/appliers-skills", controllerWrapper(async (req, res) => {
    const applierId = req.query.applier_id;

    if (!applierId) {
        throw new Error("Applier ID is required.");
    }

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
        throw new Error("Applier not found.");
    }
    const skills = applier.skills.map((skill: any) => ({
        skill_id: skill.skill_id,
        name: skill.name,
    }));
    
    return {
        message: "Skills retrieved successfully.",
        data: skills,
    };
}));

router.post("/appliers-skills", authMiddleware, controllerWrapper(async (req, res) => {
    const { applier_id, skills } = req.body;

    if (!applier_id || !skills) {
        throw new Error("Applier ID and skills are required.");
    }

    const applier = await Appliers.findByPk(applier_id);
    if (!applier) {
        throw new Error("Applier not found.");
    }

    // Use applier_id consistently here, not user_id
    const applierWithSkills = await Appliers.findOne({
        where: { applier_id: applier_id }, // Changed from user_id to applier_id
        include: [{
            model: Skills,
            as: "skills",
            attributes: ["skill_id", "name"],
            through: { attributes: [] }
        }]
    });

    const existingSkills = applierWithSkills?.skills || [] as Skill[];
    const existingSkillNames = existingSkills.map((skill: Skill) => skill.name);

    const newSkillNames = skills.filter((skill: any) => !existingSkillNames.includes(skill));

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

router.post("/experiences", authMiddleware, controllerWrapper(async (req, res) => {
    const { 
        user_type, 
        user_id, 
        company_name, 
        job_title, 
        start_date, 
        end_date, 
        description 
    } = req.body;

    if (!user_type || !user_id || !company_name || !job_title || !start_date) {
        throw new Error("User type, user ID, company name, job title, and start date are required.");
    }

    if (user_type !== 'applier' && user_type !== 'recruiter') {
        throw new Error("User type must be either 'applier' or 'recruiter'.");
    }

    let user;
    if (user_type === 'applier') {
        user = await Appliers.findOne({ where: { user_id } });
    } else {
        user = await Recruiters.findOne({ where: { user_id } });
    }

    if (!user) {
        throw new Error(`${user_type.charAt(0).toUpperCase() + user_type.slice(1)} not found.`);
    }

    const experience = await Experiences.create({
        experience_id: v4(),
        user_id,
        user_type,
        company_name,
        job_title,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        description: description || null
    });

    return {
        status: 'success',
        message: "Experience added successfully.",
        data: experience
    };
}));

router.get("/experiences", controllerWrapper(async (req, res) => {
    const { user_type, user_id } = req.query;

    if (!user_type || !user_id) {
        throw new Error("User type and user ID are required.");
    }

    if (user_type !== 'applier' && user_type !== 'recruiter') {
        throw new Error("User type must be either 'applier' or 'recruiter'.");
    }

    const experiences = await Experiences.findAll({
        where: {
            user_id,
            user_type
        },
        order: [
            ['start_date', 'DESC']
        ]
    });

    return {
        message: "Experiences retrieved successfully.",
        data: experiences
    };
}));

router.put("/experiences/:experience_id", controllerWrapper(async (req, res) => {
    const { experience_id } = req.params;
    const { 
        company_name, 
        job_title, 
        start_date, 
        end_date, 
        description 
    } = req.body;

    const experience = await Experiences.findByPk(experience_id);
    
    if (!experience) {
        throw new Error("Experience not found.");
    }

    if (company_name) experience.company_name = company_name;
    if (job_title) experience.job_title = job_title; 
    if (start_date) experience.start_date = new Date(start_date);
    if (end_date !== undefined) experience.end_date = end_date ? new Date(end_date) : null;
    if (description !== undefined) experience.description = description;

    await experience.save();

    return {
        message: "Experience updated successfully.",
        data: experience
    };
}));

router.delete("/experiences/:experience_id", controllerWrapper(async (req, res) => {
    const { experience_id } = req.params;

    const experience = await Experiences.findByPk(experience_id);
    
    if (!experience) {
        throw new Error("Experience not found.");
    }

    await experience.destroy();

    return {
        message: "Experience deleted successfully."
    };
}));

// Edit applier profile
router.put("/appliers/:id", authMiddleware, controllerWrapper(async (req, res) => {
    const applierId = req.params.id;
    
    // Ensure the authenticated user is updating their own profile
    if (req.user && req.user.id !== applierId) {
        throw new Error("You are not authorized to update this profile.");
    }
    
    const {
        name,
        email,
        about
    } = req.body;

    // Find the applier
    const applier = await Appliers.findOne({
        where: { applier_id: applierId }
    });

    if (!applier) {
        throw new Error("Applier profile not found.");
    }

    // Update fields if they are provided
    if (name !== undefined) applier.name = name;
    if (email !== undefined) applier.email = email;
    if (about !== undefined) applier.about = about;
    
    // Save the updated profile
    await applier.save();

    // Return updated applier without the password
    const { password, ...applierData } = applier.get({ plain: true });

    return {
        message: "Applier profile updated successfully.",
        data: applierData
    };
}));

export default router;