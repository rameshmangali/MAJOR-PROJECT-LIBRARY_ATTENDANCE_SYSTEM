import express from "express";
import cors from "cors"; // 1. Import the cors package
import connectDB from "./db.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

const app = express();

// 2. Use the cors middleware BEFORE your routes
// This tells your server to allow requests from any website.
app.use(cors());

app.use(express.json());
connectDB();

app.get("/", (req, res) => res.send("📚 Library Attendance System Backend Running"));
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));