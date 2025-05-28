import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { InterviewSchedules } from "../../../models/interview_schedules";
import { Appliers } from "../../../models/appliers";
import { Recruiters } from "../../../models/recruiters";
import { JobPosts } from "../../../models/job_posts";
import { Messages } from "../../../models/messages";
import authMiddleware from "../../middleware/Auth";
import { controllerWrapper } from "../../utils/controllerWrapper";

const router = express.Router();

// Create an interview schedule
router.post(
  "/",
  authMiddleware,
  controllerWrapper(async (req: Request, res: Response) => {
    const { job_id, interview_date, location, recruiter_id, applier_id, chat_id, notes } = req.body;

    // Validate required fields
    if (!job_id || !interview_date || !recruiter_id || !applier_id) {
      throw new Error("Missing required fields");
    }

    // Create new interview schedule
    const schedule = await InterviewSchedules.create({
      schedule_id: uuidv4(),
      job_id,
      interview_date: new Date(interview_date),
      location,
      recruiter_id,
      applier_id,
      status: "PENDING"
    });

    // If a chat_id is provided, create a message in the chat
    if (chat_id) {
      const interviewData = {
        date: interview_date,
        location,
        notes: notes || "",
        status: "PENDING",
        schedule_id: schedule.schedule_id
      };

      // Create a message in the chat
      await Messages.create({
        message_id: uuidv4(),
        chat_id,
        sender_id: recruiter_id,
        is_recruiter: true,
        content: JSON.stringify(interviewData),
        message_type: "INTERVIEW_REQUEST",
        timestamp: new Date(),
        status: "SENT"
      });
    }

    return {
      message: "Interview schedule created successfully",
      data: schedule
    };
  })
);

// Update interview status
router.patch(
  "/:schedule_id", 
  authMiddleware, 
  controllerWrapper(async (req: Request, res: Response) => {
    const { schedule_id } = req.params;
    const { status, message_id } = req.body;

    // Validate status
    console.log("Schedule", schedule_id)
    console.log("Status:", status);

    if (!["PENDING", "ACCEPTED", "DECLINED"].includes(status)) {
      throw new Error("Invalid status value");
    }

    console.log(1)
    // Find the interview schedule
    const schedule = await InterviewSchedules.findByPk(schedule_id);

    if (!schedule) {
      throw new Error("Interview schedule not found");
    }

    console.log(2)
    // Update the status
    schedule.status = status;
    await schedule.save();

    console.log(3)
    // If a message_id is provided, update the message content
    if (message_id) {
      const message = await Messages.findByPk(message_id);

      if (message && message.message_type === "INTERVIEW_REQUEST") {
        try {
          const interviewData = JSON.parse(message.content);
          interviewData.status = status;

          message.content = JSON.stringify(interviewData);
          await message.save();
        } catch (e) {
          console.error("Error updating message content:", e);
        }
      }
    }

    console.log(4)

    return {
      message: "Interview status updated successfully",
      data: schedule
    };
  })
);

// Get all interviews for a user
router.get(
  "/user/:user_type/:user_id", 
  authMiddleware, 
  controllerWrapper(async (req: Request, res: Response) => {
    const { user_id, user_type } = req.params;

    let where = {};
    console.log("User ID:", user_id);
    console.log(user_type)

    // Filter based on user role
    if (user_type === "applier") {
      console.log(1)
      where = { applier_id: user_id };
    } else if (user_type == "recruiter") {
      where = { recruiter_id: user_id };
    } else {
      throw new Error("Invalid user type");
    }

    console.log(2)
    // Find all interviews for the user with related entities
    const interviews = await InterviewSchedules.findAll({
      where,
      include: [
        { model: Appliers },
        { model: Recruiters },
        { model: JobPosts }
      ],
      order: [["interview_date", "DESC"]]
    });

    console.log(3)
    return {
      message: "Interviews retrieved successfully",
      data: interviews
    };
  })
);

// Get a specific interview
router.get(
  "/:schedule_id", 
  authMiddleware, 
  controllerWrapper(async (req: Request, res: Response) => {
    const { schedule_id } = req.params;

    const interview = await InterviewSchedules.findByPk(schedule_id, {
      include: [
        { model: Appliers },
        { model: Recruiters },
        { model: JobPosts }
      ]
    });

    if (!interview) {
      throw new Error("Interview schedule not found");
    }

    return {
      message: "Interview retrieved successfully",
      data: interview
    };
  })
);

export default router;