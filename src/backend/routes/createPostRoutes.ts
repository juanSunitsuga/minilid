import express from "express";
import { JobPosts } from "../../../models/job_posts";
import { Skills } from "../../../models/skills";
import { JobPostSkill } from "../../../models/job_post_skills";
import { controllerWrapper } from "../../utils/controllerWrapper";
import { JobCategories } from "../../../models/job_categories";
import { JobTypes } from "../../../models/job_types";

const router = express.Router();

// Express route handler

router.get('/job-types', async (req, res) => {
  try {
    const types = await JobTypes.findAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job types' });
  }
});

router.get('/job-categories', async (req, res) => {
  try {
    const categories = await JobCategories.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job categories' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const types = await Skills.findAll({
      attributes: ['skill_id', 'name']
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// POST endpoint untuk menambahkan skill baru
router.post('/skills', controllerWrapper(async (req, res) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Skill name is required' });
  }
  
  // Cek apakah skill sudah ada
  const existingSkill = await Skills.findOne({
    where: {
      name: name.trim()
    }
  });
  
  if (existingSkill) {
    return res.status(409).json({ 
      error: 'Skill already exists',
      skill: {
        skill_id: existingSkill.skill_id,
        name: existingSkill.name
      }
    });
  }
  
  try {
    // Buat skill baru
    const newSkill = await Skills.create({
      name: name.trim()
    });
    
    return res.status(201).json({
      message: 'Skill created successfully',
      skill_id: newSkill.skill_id,
      name: newSkill.name
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return res.status(500).json({ error: 'Failed to create skill' });
  }
}));

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
