import express from "express";
import { JobPosts } from "../../../models/job_posts";
import { Skills } from "../../../models/skills";
import { JobPostSkill } from "../../../models/job_post_skills";
import { controllerWrapper } from "../../utils/controllerWrapper";

const router = express.Router();

router.post("/jobposts", controllerWrapper(async (req, res) => {
    const {
        title,
        description,
        category_id,
        type_id,
        skills
    } = req.body;

    if (!title || !category_id || !type_id) {
        throw new Error("Title, category_id, and type_id are required fields.");
    }

    const jobPost = await JobPosts.create({
        title,
        description,
        category_id,
        type_id,
    });

    if (Array.isArray(skills) && skills.length > 0) {
        const skillInstances = await Promise.all(
            skills.map(async (skill: string) => {
                const [skillInstance] = await Skills.findOrCreate({
                    where: { name: skill },
                    attributes: ["skill_id", "name"],
                });
                return skillInstance;
            })
        );

        const jobPostSkills = skillInstances.map((skillInstance) => ({
            job_id: jobPost.job_id,
            skill_id: skillInstance.skill_id,
        }));
        await JobPostSkill.bulkCreate(jobPostSkills, {
            ignoreDuplicates: true,
        });
    }
    return {
        message: "Job post created successfully",
        jobPost: {
            job_id: jobPost.job_id,
            title: jobPost.title,
            description: jobPost.description,
            category_id: jobPost.category_id,
            type_id: jobPost.type_id,
            skills: skills || []
        }
    }

}));

export default router;
