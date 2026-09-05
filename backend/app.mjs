import { getDatabase } from "firebase/database";
import { initializeApp } from "firebase/app";
import express from 'express';
import dotenv from 'dotenv'
import httpResponse from "./Utils/httpResponse.mjs"

dotenv.config()

let firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const database = getDatabase();

const expressApp = express();
const port = 3001;

expressApp.get('/ping', (req, res) => {
  res.send('pong');
});



expressApp.post('/test', (req, res) => {
    return httpResponse(201, "Success", {}, res)
  });

expressApp.listen(port, () => {
  console.log(`Backend listining on port${port}`);
});

