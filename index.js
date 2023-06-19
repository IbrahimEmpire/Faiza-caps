import express from "express";
import dotenv from "dotenv";

import { Db, MongoClient } from "mongodb";
import { coursesRouter } from "./routes/courses.js";
import cors from "cors";
import { userRouter } from "./routes/users.js";
import { classesRouter } from "./routes/classes.js";
import { tasksRouter } from "./routes/tasks.js";
import { classesData, courseData, taskData } from "./data.js";
import { countRouter } from "./routes/count.js";
const Mongo_name = 'zenStudentDashboard'

const Mongo_URL = `mongodb+srv://afrinasik2016:abriz123@cluster0.y3zvwjc.mongodb.net/${Mongo_name}`

const app = express();
dotenv.config();
app.use(
  cors()
);

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-auth-token, Origin, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-control-Allow-Methods", "GET, POST, PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With, content-type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});


app.use(express.json());

const PORT = process.env.PORT || 4000;

const mongo_URL = Mongo_URL;

async function createConnection() {
  const client = new MongoClient(mongo_URL);
  await client.connect();
  // console.log(client);
  console.log("Mongo is connected");
  return client;
}

// const client = new MongoClient(mongo_URL)
// await client.connect()

// console.log('mongo connected');
export const client = await createConnection();

app.get("/", async function (request, response) {
  response.send("Hi, Welcome to Capstone...!!!");
});

app.use("/courses", coursesRouter);
app.use("/users", userRouter);
app.use("/classes", classesRouter);
app.use("/tasks", tasksRouter);
app.use("/count", countRouter);

// await client.db("zenStudentDashboard").collection("courses").insertMany(courseData);
// await client.db("zenStudentDashboard").collection("tasks").insertMany(taskData);

app.listen(PORT, () => console.log(`App has started in port ${PORT}`));

// export {client}