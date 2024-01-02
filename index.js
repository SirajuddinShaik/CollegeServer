import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import lodash from "lodash";
import cors from "cors";
import path from "path";

import { Student } from "./dbase/schemas.js";

import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "dbase")));

const uri = process.env.URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error.message);
  });

app
  .route("/")
  .get(async (req, res) => {
    const found = await Student.find({});
    res.json({ message: found });
  })
  .post(() => {});

app
  .route("/:student")
  .get(async (req, res) => {
    const id = lodash.upperCase(req.params.student).split(" ").join("");
    const found = await Student.find({ _id: id });
    res.json({ message: found });
  })
  .post(() => {});

// Add your application routes and logic here

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
