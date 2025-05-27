import express from "express";
import { JobPosts } from "../../../models/job_posts";
import { Skills } from "../../../models/skills";
import { JobPostSkill } from "../../../models/job_post_skills";
import { controllerWrapper } from "../../utils/controllerWrapper";
import { JobCategories } from "../../../models/job_categories";
import { JobTypes } from "../../../models/job_types";
import { Companies } from "../../../models/companies";
import { Recruiters } from "../../../models/recruiters";
import authMiddleware from "../../middleware/Auth";

const router = express.Router();

interface SkillPlain {
  skill_id: number;
  name: string;
}
// Express route handlers...
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

router.post('/skills', controllerWrapper(async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Skill name is required' });
  }

  const existingSkill = await Skills.findOne({
    where: { name: name.trim() }
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

router.post("/jobposts", authMiddleware, controllerWrapper(async (req, res) => {
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

  const user_id = req.user?.id;

  const jobPost = await JobPosts.create({
    title,
    description,
    category_id,
    type_id,
    recruiter_id: user_id
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
      recruiter_id: jobPost.recruiter_id,
      skills: skills || []
    }
  }
}));

// FIXED: Move company logic inside formattedJobs
router.get('/jobs', async (req, res) => {
  try {
    // Ambil semua job posts dengan include yang diperlukan
    const jobs = await JobPosts.findAll({
      include: [
        {
          model: JobCategories,
          as: 'category',
          attributes: ['category_id', 'category_name']
        },
        {
          model: JobTypes,
          as: 'type',
          attributes: ['type_id', 'type_name']
        },
        {
          model: Skills,
          as: 'skills',
          attributes: ['skill_id', 'name'],
          through: { attributes: [] } // Exclude junction table data
        },
        {
          model: Recruiters,
          as: 'recruiter',
          attributes: [
            'recruiter_id',
            'name',
            'company_id',
          ],
          include: [
            {
              model: Companies,
              as: 'company',
              attributes: ['company_id', 'company_name', 'address']
            }
          ]
        }
      ],
      order: [['posted_date', 'DESC']]
    });

    // Format response dengan logika company di dalam map
    const formattedJobs = jobs.map(job => {
      const plainJob = job.get({ plain: true });
      
      return {
        job_id: plainJob.job_id,
        title: plainJob.title,
        description: plainJob.description,
        recruiter_id: plainJob.recruiter_id,
        
        // Recruiter info
        recruiter: plainJob.recruiter ? {
          recruiter_id: plainJob.recruiter.recruiter_id,
          name: plainJob.recruiter.name,
          company_id: plainJob.recruiter.company_id
        } : null,
        
        // Category info
        category: plainJob.category ? {
          category_id: plainJob.category.category_id,
          name: plainJob.category.category_name
        } : null,
        
        // Type info
        type: plainJob.type ? {
          type_id: plainJob.type.type_id,
          name: plainJob.type.type_name
        } : null,
        
        // Company info - moved here from outside
        company: plainJob.recruiter?.company ? {
          company_id: plainJob.recruiter.company.company_id,
          name: plainJob.recruiter.company.company_name,
          address: plainJob.recruiter.company.address
        } : {
          company_id: null,
          name: "Unknown Company",
          address: "Unknown Address"
        },
        
        // Skills info
        skills: plainJob.skills ? plainJob.skills.map((skill: SkillPlain) => ({
          skill_id: skill.skill_id,
          name: skill.name
        })) : [],
        
        // Timestamps
        posted_date: plainJob.posted_date,
        created_at: plainJob.posted_date // For backward compatibility
      };
    });

    console.log(`Fetched ${formattedJobs.length} jobs successfully`);
    res.json(formattedJobs);
    
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ 
      error: "Failed to fetch jobs",
      details: error
    });
  }
});

export default router;