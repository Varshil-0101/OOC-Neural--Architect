import express from "express";
import { generateWithGemini } from "../services/gemini.service.js";

const router = express.Router();

// Gemini
router.post("/gemini", async (req, res) => {
  const { prompt } = req.body;
  const result = await generateWithGemini(prompt);
  res.json({ result });
});

// Custom model
router.post("/custom", (req, res) => {
  const { input } = req.body;
  res.json({
    result: `Custom model processed: ${input}`
  });
});

export default router;
