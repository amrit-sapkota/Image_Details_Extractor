import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a schema and model
const detailSchema = new mongoose.Schema({
  Date: String,
  Time: String,
  TicketNumber: String,
  IssuingCompany: String,
  TruckNumber: String,
  WasteName: String,
  GrossWeight: String,
  TareWeight: String,
  NetWeight: String,
});

const Detail = mongoose.model("Detail", detailSchema);

// API endpoint to save extracted details
app.post("/api/save-details", async (req, res) => {
  try {
    const detail = new Detail(req.body);
    await detail.save();
    res.status(201).send({ message: "Details saved successfully!" });
  } catch (err) {
    res
      .status(500)
      .send({ message: "Failed to save details", error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
