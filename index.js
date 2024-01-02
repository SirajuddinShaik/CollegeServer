import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import lodash from "lodash";
import cors from "cors";
import path from "path";
import fs from "fs";

import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";

import { pipeline } from "@xenova/transformers";
import wavefile from "wavefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ffmpegPath = path.join(__dirname, "bin", "ffmpeg.exe");
ffmpeg.setFfmpegPath(ffmpegPath);

let transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny.en",
  { chunk_length_s: 10, stride_length_s: 5 }
);
// The rest of your code remains unchanged

import { Student } from "./dbase/schemas.js";

import dotenv from "dotenv";
dotenv.config();

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
  .route("/student/:student")
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

async function downloadAndConvertAudio(youtubeUrl) {
  const tempFilePath = path.join(__dirname, "temp.mp4"); // Temporary download path

  try {
    const stream = ytdl(youtubeUrl, { filter: "audioonly" });
    await new Promise((resolve, reject) => {
      stream
        .pipe(fs.createWriteStream(tempFilePath))
        .on("finish", resolve)
        .on("error", reject);
    });

    const wavFilePath = path.join(__dirname, "audio.wav"); // Output WAV path
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .toFormat("wav")
        .on("end", resolve)
        .on("error", reject)
        .saveToFile(wavFilePath);
    });

    return wavFilePath;
  } catch (error) {
    console.error("Download or conversion failed:", error);
    throw error;
  } finally {
    // Delete temporary file
    fs.unlinkSync(tempFilePath);
  }
}

async function loadAudioData(wavFilePath) {
  try {
    const buffer = await fs.promises.readFile(wavFilePath);
    const wav = new wavefile.WaveFile(buffer);
    console.log(wav);
    wav.toBitDepth("32f"); // Pipeline expects input as a Float32Array
    wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
    let audioData = wav.getSamples();
    if (Array.isArray(audioData)) {
      if (audioData.length > 1) {
        const SCALING_FACTOR = Math.sqrt(2);

        // Merge channels (into first channel to save memory)
        for (let i = 0; i < audioData[0].length; ++i) {
          audioData[0][i] =
            (SCALING_FACTOR * (audioData[0][i] + audioData[1][i])) / 2;
        }
      }

      // Select first channel
      audioData = audioData[0];
    }
    return audioData;
    // ... rest of your audio processing code
  } catch (error) {
    console.error("Failed to load audio data:", error);
    throw error;
  }
}

app
  .route("/transcribe")
  .post(async (req, res) => {
    try {
      const youtubeUrl = req.query.youtubeUrl; // Get YouTube link from request body

      // Download and convert to WAV
      const wavFilePath = await downloadAndConvertAudio(youtubeUrl);

      // Load audio data
      const audioData = await loadAudioData(wavFilePath);

      // Process audio using your transcriber function
      const output = await transcriber(audioData, {
        chunk_length_s: 29,
      });

      res.json({ transcription: output });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Transcription failed" });
    }
  })
  .get((req, res) => {
    res.json({ transcription: "hlo" });
  });
