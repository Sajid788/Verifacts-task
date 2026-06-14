import "dotenv/config";
import express from "express";
import cors from "cors";
import { connection, PORT } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import caseRoutes from "./routes/cases.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "VeriFacts Case Management API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("Connected to database");
  } catch (error) {
    console.log("Database connection error:", error.message);
  }
  console.log(`Server running on port ${PORT}`);
});
