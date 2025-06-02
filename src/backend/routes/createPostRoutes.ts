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
    const types = await JobTypes.findAll({
      attributes: ['type_id', 'type']
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job types' });
  }
});

router.get('/job-categories', async (req, res) => {
  try {
    const categories = await JobCategories.findAll({
      attributes: ['category_id', 'category']
    });
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
  console.log('💼 Creating job post - Request body:', req.body);
  console.log('👤 User from auth:', req.user);

  const {
    title,
    description,
    category_id,
    type_id,
    skills,
    salary_min,
    salary_max,
    salary_type
  } = req.body;

  if (!title || !description || !category_id || !type_id) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["title", "description", "category_id", "type_id"],
      received: { title, description, category_id, type_id }
    });
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({
      error: "At least one skill is required",
      received: skills
    });
  }

  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: "User authentication failed" });
  }

  try {
    const recruiter = await Recruiters.findOne({
      where: {
        recruiter_id: user_id
      }
    });

    console.log('👤 Found recruiter:', recruiter);

    if (!recruiter) {
      return res.status(403).json({
        error: "User is not registered as a recruiter",
        user_id: user_id,
        suggestion: "Please register as a recruiter first"
      });
    }

    const recruiter_id = recruiter.recruiter_id;

    const jobPostData: any = {
      title,
      description,
      category_id: parseInt(category_id),
      type_id: parseInt(type_id),
      recruiter_id: recruiter_id,
    };

    // Add salary fields if provided
    if (salary_min) jobPostData.salary_min = parseInt(salary_min);
    if (salary_max) jobPostData.salary_max = parseInt(salary_max);
    if (salary_type) jobPostData.salary_type = salary_type;

    const jobPost = await JobPosts.create(jobPostData);

    if (Array.isArray(skills) && skills.length > 0) {
      console.log('🎯 Adding skills:', skills);

      const skillInstances = await Promise.all(
        skills.map(async (skill: string) => {
          const [skillInstance] = await Skills.findOrCreate({
            where: { name: skill.trim() },
            defaults: { name: skill.trim() }
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

    const response = {
      message: "Job post created successfully",
      jobPost: {
        job_id: jobPost.job_id,
        title: jobPost.title,
        description: jobPost.description,
        category_id: jobPost.category_id,
        type_id: jobPost.type_id,
        recruiter_id: jobPost.recruiter_id,
        salary_min: jobPost.salary_min,
        salary_max: jobPost.salary_max,
        salary_type: jobPost.salary_type,
        skills: skills || []
      }
    };

    return res.status(201).json(response);

  } catch (error) {
    return res.status(500).json({
      error: "Failed to create job post",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

router.delete('/jobs/:jobId', authMiddleware, controllerWrapper(async (req, res) => {
  const { jobId } = req.params;

  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: "User authentication failed" });
  }
  const existingJob = await JobPosts.findOne({
    where: { job_id: jobId },
    include: [
      {
        model: Recruiters,
        as: 'recruiter',
        attributes: ['recruiter_id', 'name']
      }
    ]
  });

  if (!existingJob) {
    return res.status(404).json({ error: "Job not found" });
  }

  const recruiter = await Recruiters.findOne({
    where: { recruiter_id: user_id }
  });

  if (!recruiter) {
    return res.status(403).json({
      error: "User is not registered as a recruiter"
    });
  }

  if (existingJob.recruiter_id !== recruiter.recruiter_id) {
    return res.status(403).json({
      error: "You can only delete your own job posts"
    });
  }

  await JobPostSkill.destroy({
    where: { job_id: jobId }
  });
  const deletedCount = await JobPosts.destroy({
    where: { job_id: jobId }
  });

  if (deletedCount === 0) {
    return res.status(500).json({
      error: "Failed to delete job post",
      details: "No rows were affected"
    });
  }

  return res.status(200).json({
    message: "Job post deleted successfully",
    deleted_job: {
      job_id: jobId,
      title: existingJob.title,
      recruiter: existingJob.recruiter?.name || "Unknown"
    }
  });
}));

// ✅ ADD: Get single job by ID
router.get('/jobs/:jobId', controllerWrapper(async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`📋 Fetching job details for ID: ${jobId}`);

    const job = await JobPosts.findOne({
      where: { job_id: jobId },
      attributes: [
        'job_id',
        'title',
        'description',
        'category_id',
        'type_id',
        'recruiter_id',
        'posted_date',
        'salary_min',
        'salary_max',
        'salary_type'
      ],
      include: [
        {
          model: JobCategories,
          as: 'category',
          attributes: ['category_id', 'category']
        },
        {
          model: JobTypes,
          as: 'type',
          attributes: ['type_id', 'type']
        },
        {
          model: Skills,
          as: 'skills',
          attributes: ['skill_id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Recruiters,
          as: 'recruiter',
          attributes: ['recruiter_id', 'name', 'company_id'],
          include: [
            {
              model: Companies,
              as: 'company',
              attributes: ['company_id', 'company_name', 'address']
            }
          ]
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const plainJob = job.get({ plain: true });

    const formattedJob = {
      job_id: plainJob.job_id,
      title: plainJob.title,
      description: plainJob.description,
      recruiter_id: plainJob.recruiter_id,
      salary_min: plainJob.salary_min,
      salary_max: plainJob.salary_max,
      salary_type: plainJob.salary_type,

      recruiter: plainJob.recruiter ? {
        recruiter_id: plainJob.recruiter.recruiter_id,
        name: plainJob.recruiter.name,
        company_id: plainJob.recruiter.company_id
      } : null,

      category: plainJob.category ? {
        category_id: plainJob.category.category_id,
        name: plainJob.category.category
      } : null,

      type: plainJob.type ? {
        type_id: plainJob.type.type_id,
        name: plainJob.type.type
      } : null,

      company: plainJob.recruiter?.company ? {
        company_id: plainJob.recruiter.company.company_id,
        name: plainJob.recruiter.company.company_name,
        address: plainJob.recruiter.company.address
      } : {
        company_id: null,
        name: "Unknown Company",
        address: "Unknown Address"
      },

      skills: plainJob.skills ? plainJob.skills.map((skill: any) => ({
        skill_id: skill.skill_id,
        name: skill.name
      })) : [],

      posted_date: plainJob.posted_date
    };
    res.json(formattedJob);

  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch job details",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// FIXED: Move company logic inside formattedJobs
router.get('/jobs', async (req, res) => {
  try {
    console.log('📋 Fetching all jobs...');

    const jobs = await JobPosts.findAll({
      include: [
        {
          model: JobCategories,
          as: 'category',
          attributes: ['category_id', 'category']
        },
        {
          model: JobTypes,
          as: 'type',
          attributes: ['type_id', 'type']
        },
        {
          model: Skills,
          as: 'skills',
          attributes: ['skill_id', 'name'],
          through: { attributes: [] }
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

    const formattedJobs = jobs.map(job => {
      const plainJob = job.get({ plain: true });

      return {
        job_id: plainJob.job_id,
        title: plainJob.title,
        description: plainJob.description,
        recruiter_id: plainJob.recruiter_id,

        recruiter: plainJob.recruiter ? {
          recruiter_id: plainJob.recruiter.recruiter_id,
          name: plainJob.recruiter.name,
          company_id: plainJob.recruiter.company_id
        } : null,

        category: plainJob.category ? {
          category_id: plainJob.category.category_id,
          name: plainJob.category.category
        } : null,

        type: plainJob.type ? {
          type_id: plainJob.type.type_id,
          name: plainJob.type.type
        } : null,

        company: plainJob.recruiter?.company ? {
          company_id: plainJob.recruiter.company.company_id,
          name: plainJob.recruiter.company.company_name,
          address: plainJob.recruiter.company.address
        } : {
          company_id: null,
          name: "Unknown Company",
          address: "Unknown Address"
        },

        skills: plainJob.skills ? plainJob.skills.map((skill: SkillPlain) => ({
          skill_id: skill.skill_id,
          name: skill.name
        })) : [],
        salary_min: plainJob.salary_min,
        salary_max: plainJob.salary_max,
        salary_type: plainJob.salary_type,
        posted_date: plainJob.posted_date,
        created_at: plainJob.posted_date
      };
    });

    console.log(`✅ Fetched ${formattedJobs.length} jobs successfully`);
    res.json(formattedJobs);

  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({
      error: "Failed to fetch jobs",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/jobs/:jobId', authMiddleware, controllerWrapper(async (req, res) => {
  const { jobId } = req.params;
  const {
    salary_min,
    salary_max,
    salary_type,
    category_id,
    type_id
  } = req.body;

  if (!category_id || !type_id) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["category_id", "type_id"],
      received: { category_id, type_id }
    });
  }

  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(401).json({ error: "User authentication failed" });
  }

  try {
    const existingJob = await JobPosts.findOne({
      where: { job_id: jobId },
      include: [
        {
          model: Recruiters,
          as: 'recruiter',
          attributes: ['recruiter_id']
        }
      ]
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    const recruiter = await Recruiters.findOne({
      where: { recruiter_id: user_id }
    });

    if (!recruiter) {
      return res.status(403).json({
        error: "User is not registered as a recruiter"
      });
    }

    if (existingJob.recruiter_id !== recruiter.recruiter_id) {
      return res.status(403).json({
        error: "You can only edit your own job posts"
      });
    }

    const categoryExists = await JobCategories.findByPk(parseInt(category_id));
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid category_id" });
    }

    const typeExists = await JobTypes.findByPk(parseInt(type_id));
    if (!typeExists) {
      return res.status(400).json({ error: "Invalid type_id" });
    }

    const validSalaryTypes = ['hourly', 'daily', 'monthly', 'yearly'];
    if (salary_type && !validSalaryTypes.includes(salary_type)) {
      return res.status(400).json({
        error: "Invalid salary_type",
        valid_types: validSalaryTypes
      });
    }

    const updateData: any = {
      category_id: parseInt(category_id),
      type_id: parseInt(type_id)
    };

    if (salary_min !== undefined) {
      updateData.salary_min = salary_min ? parseInt(salary_min) : null;
    }
    if (salary_max !== undefined) {
      updateData.salary_max = salary_max ? parseInt(salary_max) : null;
    }
    if (salary_type !== undefined) {
      updateData.salary_type = salary_type || null;
    }

    const [updatedCount] = await JobPosts.update(updateData, {
      where: { job_id: jobId },
      returning: true
    });

    if (updatedCount === 0) {
      return res.status(500).json({ error: "Failed to update job" });
    }

    // Fetch updated job with relations
    const updatedJob = await JobPosts.findOne({
      where: { job_id: jobId },
      attributes: [
        'job_id',
        'title',
        'description',
        'category_id',
        'type_id',
        'recruiter_id',
        'posted_date',
        'salary_min',
        'salary_max',
        'salary_type'
      ],
      include: [
        {
          model: JobCategories,
          as: 'category',
          attributes: ['category_id', 'category']
        },
        {
          model: JobTypes,
          as: 'type',
          attributes: ['type_id', 'type']
        },
        {
          model: Skills,
          as: 'skills',
          attributes: ['skill_id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Recruiters,
          as: 'recruiter',
          attributes: ['recruiter_id', 'name', 'company_id'],
          include: [
            {
              model: Companies,
              as: 'company',
              attributes: ['company_id', 'company_name', 'address']
            }
          ]
        }
      ]
    });

    if (!updatedJob) {
      return res.status(500).json({ error: "Failed to fetch updated job" });
    }

    const plainJob = updatedJob.get({ plain: true });

    const formattedJob = {
      job_id: plainJob.job_id,
      title: plainJob.title,
      description: plainJob.description,
      recruiter_id: plainJob.recruiter_id,
      salary_min: plainJob.salary_min,
      salary_max: plainJob.salary_max,
      salary_type: plainJob.salary_type,

      recruiter: plainJob.recruiter ? {
        recruiter_id: plainJob.recruiter.recruiter_id,
        name: plainJob.recruiter.name,
        company_id: plainJob.recruiter.company_id
      } : null,

      category: plainJob.category ? {
        category_id: plainJob.category.category_id,
        category: plainJob.category.category
      } : null,

      type: plainJob.type ? {
        type_id: plainJob.type.type_id,
        type: plainJob.type.type
      } : null,

      company: plainJob.recruiter?.company ? {
        company_id: plainJob.recruiter.company.company_id,
        name: plainJob.recruiter.company.company_name,
        address: plainJob.recruiter.company.address
      } : {
        company_id: null,
        name: "Unknown Company",
        address: "Unknown Address"
      },

      skills: plainJob.skills ? plainJob.skills.map((skill: any) => ({
        skill_id: skill.skill_id,
        name: skill.name
      })) : [],

      posted_date: plainJob.posted_date
    };

    return res.status(200).json({
      message: "Job updated successfully",
      job: formattedJob
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to update job",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;