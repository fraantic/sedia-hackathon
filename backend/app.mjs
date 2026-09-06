import { getDatabase, ref, set, update, remove, get, child  } from "firebase/database";
import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
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
api.use(express.json({ limit: "10mb" }));
const port = 3001;

Object.filter = (obj, predicate) => 
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

api.get('/ping', (req, res) => {
  res.send('pong');
});

function removeBlankAttributes(obj) {
    const result = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}



api.post('/test', (req, res) => {
    return httpResponse(201, "Success", {}, res)
});

//api.post("/location/reportadd")
// Temporary fix.

api.post("/location/add", (req,res) => {
  //try {
    let { body } = req

    let obj = {
      // location details
      address: body.address,
      description: body.description,
      walkway: body.walkway,
      rampAvailability : body.rampAvailability,
      parking: body.parking,
      twsi: body.twsi,
      email: body.email,
      details: body.details,
      obstruction: body.obstruction,
      image: body.image,
      ramp: body.ramp,
      likes: 0,
      dislikes: 0,
      status: body.status,
    }

    set(ref(database, 'location/' + uuidv6()), obj).then(() =>{
      return httpResponse(201, "Success", {obj}, res)
     }).catch((error) => {
           return httpResponse(400, "Error", JSON.stringify(error), res)
     });
    

  // } catch (error) {
  //   return httpResponse(400, "Error", JSON.stringify(error), res)
  // }
})

api.post("/location/update", (req, res) => {
  try {
    let { body } = req
    console.log(body)
    let obj = {
      address: body.address != null || undefined ? body.address : null,
      description: body.description != null || undefined ? body.description : null,
      walkway: body.walkway != null || undefined ? body.walkway : null,
      rampAvailability : body.rampAvailability != null || undefined ? body.rampAvailability : null,
      parking: body.parking != null || undefined ? body.parking : null,
      twsi: body.twst != null || undefined ? body.twst : null,
      email: body.email != null || undefined ? body.email : null,
      details: body.details != null || undefined ? body.details : null,
      obstruction: body.obstruction != null || undefined ? body.obstruction : null,
      image: body.image != null || undefined ? body.image : null,
      ramp: body.ramp != null || undefined ? body.ramp : null,
      likes: body.likes != null || undefined ? body.likes : null,
      dislikes: body.dislikes != null || undefined ? body.dislikes : null,
      status: body.status != null || undefined ? body.status : null,
    }

    update(ref(database, 'location/' + body.locationId), removeBlankAttributes(obj))

    return httpResponse(201, "Success", removeBlankAttributes(obj), res)

    
  } catch (error) {
    return httpResponse(400, "Error", JSON.stringify(error), res)
  }
})


api.post("/location/delete", (req, res) => {
  try {
    let { body } = req
    remove(ref(database, 'location/' + body.locationId))
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
  let result;
  get(child(ref(database), 'location/')).then((snapshot) => {
    if (snapshot.exists()) {
      result = snapshot.val()
      return httpResponse(201, "Success", Object.filter(result, a => a.status == "pending"), res)
    } else {
      return httpResponse(404, "Error", "Error no data available", res)
    }}).catch((error) => {
      return httpResponse(400, "Error", JSON.stringify(error), res)
    });
})

api.get("/location/getapproved", (req, res) => {
  let result;
  get(child(ref(database), 'location/')).then((snapshot) => {
    if (snapshot.exists()) {
      result = snapshot.val()
      return httpResponse(201, "Success", Object.filter(result, a => a.status != "pending"), res)
    } else {
      return httpResponse(404, "Error", "Error no data available", res)
    }}).catch((error) => {
      return httpResponse(400, "Error", JSON.stringify(error), res)
    });

})

api.post("/location/report/add", (req, res) => {
    let { body } = req
    let reportid = uuidv6()
    let obj = {
      id: reportid,
      locationId: body.locationId,
      address: body.address != null || undefined ? body.address : null,
      description: body.description != null || undefined ? body.description : null,
      walkway: body.walkway != null || undefined ? body.walkway : null,
      rampAvailability : body.rampAvailability != null || undefined ? body.rampAvailability : null,
      parking: body.parking != null || undefined ? body.parking : null,
      twsi: body.twst != null || undefined ? body.twst : null,
      email: body.email != null || undefined ? body.email : null,
      details: body.details != null || undefined ? body.details : null,
      obstruction: body.obstruction != null || undefined ? body.obstruction : null,
      image: body.image != null || undefined ? body.image : null,
      ramp: body.ramp != null || undefined ? body.ramp : null,
      status: "pending",
    }

    set(ref(database, 'report/' + reportid), removeBlankAttributes(obj)).then(() =>{
      return httpResponse(201, "Success", removeBlankAttributes(obj), res)
     }).catch((error) => {
           return httpResponse(400, "Error", JSON.stringify(error), res)
     });
})

api.post("/location/report/delete", (req, res) => {
  try {
    let { body } = req
    remove(ref(database, 'report/' + body.id))
    return httpResponse(201, "Success", {}, res)
  } catch {
    return httpResponse(400, "Error", JSON.stringify(error), res)
  }
})


api.get("/location/report/getapproved", (req, res) => {
  let result;
  get(child(ref(database), 'report/')).then((snapshot) => {
    if (snapshot.exists()) {
      result = snapshot.val()
      return httpResponse(201, "Success", Object.filter(result, a => a.status != "pending"), res)
    } else {
      return httpResponse(404, "Error", "Error no data available", res)
    }}).catch((error) => {
      return httpResponse(400, "Error", JSON.stringify(error), res)
    });
})

api.get("/location/report/getpending", (req, res) => {
  let result;
  get(child(ref(database), 'report/')).then((snapshot) => {
    if (snapshot.exists()) {
      result = snapshot.val()
      return httpResponse(201, "Success", Object.filter(result, a => a.status == "pending"), res)
    } else {
      return httpResponse(404, "Error", "Error no data available", res)
    }}).catch((error) => {
      return httpResponse(400, "Error", JSON.stringify(error), res)
    });
})

api.post("/location/report/approve", (req, res) => {

    let { body } = req
    let results;
    get(child(ref(database), 'report/' + body.id)).then((snapshot) => {
      if (snapshot.exists()) {
        results = snapshot.val()
        update(ref(database, 'location/' + results.locationId), results)
        let updateobj = {
          status: "approved"
        }
        update(ref(database, 'report/' + body.id), updateobj)
        return httpResponse(201, "Success", removeBlankAttributes(results), res)

      } else {
        return httpResponse(404, "Error", "Error no data available", res)
      }}).catch((error) => {
        return httpResponse(400, "Error", JSON.stringify(error), res)
      });
  





})


api.listen(port, () => {
  console.log(`Backend listining on port${port}`);
});

