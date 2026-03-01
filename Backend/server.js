import express from "express";
import cors from "cors";

import notesRoutes from "./routes/notes.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import priorityRoutes from "./routes/priority.routes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/notes", notesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/priority", priorityRoutes);

app.get("/", (_, res) => {
  res.send("Neural Architect Backend Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
