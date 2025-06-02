import express from "express";
import { Recruiters } from "../../../models/recruiters";
import { Companies } from "../../../models/companies";
import { controllerWrapper } from "../../utils/controllerWrapper";
import authMiddleware from "../../middleware/Auth";
import { v4 } from "uuid";

const router = express.Router();

