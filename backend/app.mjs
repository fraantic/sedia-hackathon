import { getDatabase, ref, set, update, remove, get, child  } from "firebase/database";
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
  appId: process.env.FB_APP_ID,
  databaseURL: process.env.FB_DATABASE_URL
};

const firebaseApp = initializeApp(firebaseConfig);

const database = getDatabase();

const api = express();
api.use(express.json())
const port = 3001;

api.get('/ping', (req, res) => {
  res.send('pong');
});



api.post('/test', (req, res) => {
    return httpResponse(201, "Success", {}, res)
});

api.post("/location/add", (req,res) => {
  try {
    let { body } = req

    let obj = {
      address: body.address,
      description: body.description,
      rampAvailablity : body.rampAvailability,
      email: body.email,
      obstruction: body.obstruction,
      likes: 0,
      dislikes: 0,
      status: body.status
    }

    set(ref(database, 'location/' + body.locationId), obj).then(() =>{
      return httpResponse(201, "Success", {obj}, res)
    }).catch((error) => {
          return httpResponse(400, "Error", JSON.stringify(error), res)
    });
    

  } catch (error) {
    return httpResponse(400, "Error", JSON.stringify(error), res)
  }
})

api.post("/location/like", (req, res) => {
  try {
    let { body } = req
    update(ref(database, 'location/' + body.locationId), {
      likes: body.likediff
    })

    return httpResponse(201, "Success", {}, res)

    
  } catch (error) {
    return httpResponse(400, "Error", JSON.stringify(error), res)
  }
})

api.post("/location/dislike", (req, res) => {
    try {
    let { body } = req
    update(ref(database, 'location/' + body.locationId), {
      dislikes: body.likediff
    })

    return httpResponse(201, "Success", {}, res)

    
  } catch (error) {
    return httpResponse(400, "Error", JSON.stringify(error), res)
  }
})

api.post("/location/delete", (req, res) => {
  try {
    let { body } = req
    remove(ref(ref(database, 'location/' + body.locationId)))
    return httpResponse(201, "Success", {}, res)
  } catch {
    return httpResponse(400, "Error", JSON.stringify(error), res)
  }

})

api.get("/location/getall", (req, res) => {
  get(child(ref(database), 'location/')).then((snapshot) => {
    if (snapshot.exists()) {
      return httpResponse(201, "Success", snapshot.val(), res)
    } else {
      return httpResponse(404, "Error", "Error no data available", res)
    }}).catch((error) => {
      return httpResponse(400, "Error", JSON.stringify(error), res)
    });
})

api.get("/location/getpending", (req, res) => {
  let { body } = req

})

api.post("/location/getapproved", (req, res) => {
  let { body } = req

})





api.listen(port, () => {
  console.log(`Backend listining on port${port}`);
});

