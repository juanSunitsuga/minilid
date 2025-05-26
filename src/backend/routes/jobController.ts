import { Router, Request, Response } from "express";
import { JobPosts } from "../../../models/job_posts";
import { JobTypes } from "../../../models/job_types";
import { JobCategories } from "../../../models/job_categories";
import { Skills } from "../../../models/skills";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";

const router = Router();

router.get("/jobs", authMiddleware, controllerWrapper(async (req: Request, res: Response) => {
  const jobs = await JobPosts.findAll({
    where: { deleted: false },
    include: [
      { model: JobTypes, attributes: ["type_id", "type"] },
      { model: JobCategories, attributes: ["category_id", "category"] },
      { model: Skills, attributes: ["skill_id", "skill"], through: { attributes: [] } }
    ]
  });
  res.json(jobs);
}));

export default router;