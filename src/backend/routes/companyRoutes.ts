import express, { Router } from "express";
import { Recruiters } from "../../../models/recruiters";
import { Companies } from "../../../models/companies";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";
import { v4 } from "uuid";
import { JobPosts } from "../../../models/job_posts";

const router = express.Router();

router.get('/profile/:companyID', controllerWrapper(async (req, res) => {
    const companyID = req.params.companyID; 
    if (!companyID) {
        throw new Error("Company ID is required."); 
    }

    const company = await Companies.findOne({
        where: { company_id: companyID },
        include: [
            {
                model: Recruiters,
                as: "recruiters",
                include: [{ model: JobPosts, as: "job_posts" }],
            }
        ]
    });

    let recruiterCount = 0;
    let jobPostCount = 0;

    if (company && company.recruiters) {
        recruiterCount = company.recruiters.length;
        jobPostCount = company.recruiters.reduce(
            (acc: number, recruiter: any) =>
                acc + (recruiter.job_posts ? recruiter.job_posts.length : 0),
            0
        );
    }

    if (!company) {
        throw new Error("Company not found.");
    }

    return {
        message: "Company profile retrieved successfully.",
        data: company, 
        recruiterCount, 
        jobPostCount
    }
}));

router.put('/:companyID', authMiddleware, controllerWrapper(async (req, res) => {
    const companyID = req.params.companyID;
    const { address, description } = req.body;

    if (!companyID) {
        throw new Error("Company ID is required.");
    }

    const company = await Companies.findOne({
        where: { company_id: companyID },
    });

    if (!company) {
        throw new Error("Company not found.");
    }

    await Companies.update(
        {
            address,
            description,
        },
        {
            where: { company_id: companyID },
        }
    );

    // Get the updated company data
    const updatedCompany = await Companies.findOne({
        where: { company_id: companyID },
    });

    return {
        message: "Company profile updated successfully.",
        data: updatedCompany,
    };
}));

router.delete('/:companyID', authMiddleware, controllerWrapper(async (req, res) => {
    const companyID = req.params.companyID; // Fixed: was req.params.companyId (missing 'D')
    
    if (!companyID) {
        throw new Error("Company ID is required.");
    }

    const company = await Companies.findOne({
        where: { company_id: companyID },
    });

    if (!company) {
        throw new Error("Company not found.");
    }

    // First, set all recruiters' company_id to null to maintain referential integrity
    await Recruiters.update(
        { company_id: null },
        { where: { company_id: companyID } }
    );

    // Then delete all job posts associated with this company's recruiters
    const recruiters = await Recruiters.findAll({
        where: { company_id: companyID }
    });

    for (const recruiter of recruiters) {
        await JobPosts.destroy({
            where: { recruiter_id: recruiter.recruiter_id }
        });
    }

    // Finally, delete the company
    await Companies.destroy({
        where: { company_id: companyID },
    });

    return {
        message: "Company deleted successfully.",
    };
}));

export default router;
