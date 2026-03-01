import express from "express";
import { calculatePriority } from "../services/priority.service.js";

const router = express.Router();

router.post("/", (req, res) => {
  const priority = calculatePriority(req.body);
  res.json({ priority });
});

export default router;
