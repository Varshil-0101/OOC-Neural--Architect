import express from "express";
import { readNotes, writeNotes } from "../services/storage.service.js";

const router = express.Router();

// GET all notes
router.get("/", (_, res) => {
  res.json(readNotes());
});

// CREATE note
router.post("/", (req, res) => {
  const notes = readNotes();
  const note = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  notes.push(note);
  writeNotes(notes);
  res.json(note);
});

// DELETE note
router.delete("/:id", (req, res) => {
  const notes = readNotes().filter(
    n => n.id !== Number(req.params.id)
  );
  writeNotes(notes);
  res.json({ success: true });
});

export default router;
