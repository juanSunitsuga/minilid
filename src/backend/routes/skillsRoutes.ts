import express from "express";
import { Skills } from "../../../models/skills";
import { Appliers } from "../../../models/appliers";
import { ApplierSkill } from "../../../models/applier_skill";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";
import { Op } from "sequelize";

const router = express.Router();

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                userType: "applier" | "recruiter",
            };
        }
    }
}

// =============================================
// SKILLS MANAGEMENT ROUTES
// =============================================

router.get("/appliers-skills", controllerWrapper(async (req, res) => {
    const applierId = req.body.applier_id;

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

router.post("/appliers-skills/create", authMiddleware, controllerWrapper(async (req, res) => {
    console.log('\n\n\nETETETTETETETTTE');
    const applierId = req.user?.id;

    const skills: string[] = Array.isArray(req.body) ? req.body : [req.body];

    if (skills.length > 0) {
        //Fetch existing tags from the database
        const existingSkills = await Skills.findAll({
            where: {
                name: {
                    [Op.in]: skills,
                },
            },
        });

        // Get the tag names that exist
        const existingSkillsNames = existingSkills.map(skill => skill.name);

        // Find tags that do not exist yet
        const newSkills = skills.filter(skill => !existingSkillsNames.includes(skill));

        // Insert new tags into the Tags table
        const createdSkills = await Promise.all(
            newSkills.map(async (skillName) => {
                return await Skills.create({
                    name: skillName,
                });
            })
        );

        // Combine existing and newly created tags
        const allSkillInstances = [
            ...existingSkills,
            ...createdSkills
        ];

        // Add entries to PostTags table using the PostTags model
        await Promise.all(
            allSkillInstances.map(async (skill) => {
                // Check if the relation already exists
                const exists = await ApplierSkill.findOne({
                    where: {
                        applier_id: applierId,
                        skill_id: skill.skill_id,
                    },
                });
                if (!exists) {
                    await ApplierSkill.create({
                        applier_id: applierId,
                        skill_id: skill.skill_id,
                    });
                }
            })
        );
    }
})
);

router.delete("/appliers-skills/:skill_id", authMiddleware, controllerWrapper(async (req, res) => {
    const applierId = req.user?.id;
    const skillId = parseInt(req.params.skill_id, 10);

    if (!applierId || isNaN(skillId)) {
        throw new Error("Invalid request parameters.");
    }

    // Check if the skill exists
    const skill = await Skills.findByPk(skillId);
    if (!skill) {
        throw new Error("Skill not found.");
    }

    // Remove the skill from the applier's skills
    await ApplierSkill.destroy({
        where: {
            applier_id: applierId,
            skill_id: skillId,
        },
    });

    return {
        message: "Skill removed successfully.",
    };
}
));

export default router;