import express from "express";
import { JobPosts } from "../../../models/job_posts";
import { Skills } from "../../../models/skills";
import { JobPostSkill } from "../../../models/job_post_skills";

const router = express.Router();

router.post("/jobposts", async (req, res) => {
    try {
        const {
            title,
            description,
            category_id,
            type_id,
            skills
        } = req.body;

        if (!title || !category_id || !type_id) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // 1. Buat job post
        const jobPost = await JobPosts.create({
            title,
            description,
            category_id,
            type_id,
        });

        // 2. Proses skills jika ada
        if (Array.isArray(skills) && skills.length > 0) {
            // Temukan atau buat skill
            const skillInstances = await Promise.all(
                skills.map(async (skill: string) => {
                    const [skillInstance] = await Skills.findOrCreate({
                        where: { name: skill },
                        attributes: ["skill_id", "name"],
                    });
                    return skillInstance;
                })
            );

            // Masukkan ke tabel pivot job_post_skills
            const jobPostSkills = skillInstances.map((skillInstance) => ({
                job_id: jobPost.job_id,
                skill_id: skillInstance.skill_id,
            }));
            await JobPostSkill.bulkCreate(jobPostSkills, {
                ignoreDuplicates: true,
            });
        }
        return res.status(201).json({ message: "Job post created", jobPost });
    } catch (error) {
        console.error("Create JobPost Error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

export default router;
