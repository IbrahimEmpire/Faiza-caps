import express from "express";
import { client } from "../index.js";
import {ObjectId} from "mongodb";
import { auth } from "../middleware/auth.js";

const router = express.Router();

//Route for getting all the courses
router.get("/getAllCourses", auth, async function(req,res){
    const coursesData = await client.db("zenStudentDashboard").collection("courses").find().toArray();
    res.send(coursesData);
})

//Route for getting Course by Id
router.get("/:id", auth, async function(req,res){
    const {id} = req.params;
    console.log(id);
    const courseInfo = await client.db("zenStudentDashboard").collection("courses").find({_id: ObjectId(id)}).toArray();
    res.send(courseInfo[0]);
})


//Route for updating completed course in user Details

router.put("/updateStatus/:courseId", auth, async function(req,res){

    const {userName, courseName, percentageCompleted, isCourseFinished} = req.body;
    const {courseId} = req.params;
    const courseData = { courseId : courseId, courseName : courseName, percentageCompletion : percentageCompleted, isCourseFinished : isCourseFinished}
    console.log(courseData);
    try{
        let userArray = await client.db("zenStudentDashboard").collection("users").find({userName : userName}).toArray();
        // console.log("userArray", userArray);
        let coursesUndertaken = userArray[0].coursesUndertaken;
        // console.log("coursesUndertaken", coursesUndertaken);
        const isCourseExists = coursesUndertaken.find((value)=>value.courseName===courseName);
        // console.log("isCourseExists", isCourseExists);
        if(!isCourseExists){
            userArray[0].coursesUndertaken = [...coursesUndertaken,courseData];
            // console.log("before",userArray[0].coursesUndertaken);
        }else{
            // console.log(userArray[0].tasksCompleted, taskDetails);
            const arrayExcludingPrevSol = userArray[0].coursesUndertaken.filter((value)=>value.courseName !== courseName);
            userArray[0].coursesUndertaken = [...arrayExcludingPrevSol,courseData];
            console.log("after",userArray[0].coursesUndertaken);
        }

        const result = await client.db("zenStudentDashboard").collection("users").updateOne({userName : userName},{$set: {coursesUndertaken : userArray[0].coursesUndertaken}});
        res.send(result);
    }catch(e){
        res.status(404).send("User Name did not found or " + e )
    }
})


// Route for getting course status when entered in to course page

router.get("/:userId/getCourseStatus/:courseId", auth, async function(req,res){

    const {userId,courseId} = req.params;
    console.log(userId,courseId);
    // let isCourseCompleted = false;

    let userDetails = await client.db("zenStudentDashboard").collection("users").find({_id: ObjectId(userId)}).toArray();
    console.log("userDetails",userDetails);
    let userCoursesDetails = userDetails[0].coursesUndertaken;
    console.log("userCoursesDetails",userCoursesDetails);
    let courseStatus = userCoursesDetails.filter((value)=>value.courseId === courseId);
    console.log(courseStatus);
    const courseDetails = await client.db("zenStudentDashboard").collection("courses").find({_id: ObjectId(courseId)}).toArray();
    const courseName = courseDetails[0].course;
    console.log(courseName)
    let data;
    if(!courseStatus.length){
        data = {
            courseId: courseId,
            courseName: courseName,
            percentageCompletion: 0,
            isCourseFinished: false
        }
        const result = await client.db("zenStudentDashboard").collection("users").updateOne({_id : ObjectId(userId)},{$push: {coursesUndertaken : data}});
    }
    userDetails = await client.db("zenStudentDashboard").collection("users").find({_id: ObjectId(userId)}).toArray();
    console.log(data,userDetails)
    userCoursesDetails = userDetails[0].coursesUndertaken;
    courseStatus = userCoursesDetails.filter((value)=>value.courseId === courseId);
    res.send(courseStatus[0]);
})




//Route for getting user all course status in Dashboard page

router.get("/userCourses/:userId", auth, async function(req,res){
    const {userId} = req.params;
    const coursesInfo = await client.db("zenStudentDashboard").collection("courses").find().toArray();
    const coursesList = coursesInfo.map((value)=>value.course ? value.course : "");

    const userCoursesInfo = await client.db("zenStudentDashboard").collection("users").find({_id : ObjectId(userId)}).toArray();
    const userCourseData = userCoursesInfo[0].coursesUndertaken;

// console.log(coursesList);
// console.log(userCourseData);

    const userCourseStatus = coursesList.map((value)=>{
        let percentage;
        const matchedCourse = userCourseData.filter((value1)=>value1.courseName === value);
        // console.log(value, matchedCourse);
        percentage = matchedCourse.length ? matchedCourse[0].percentageCompletion : 0;

        return {courseName : value, percentageCompletion : percentage};
        
    })

    res.send(userCourseStatus);
})



export const coursesRouter = router;