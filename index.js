const express = require("express");
const app = express();
require("dotenv").config();

const userRoutes = require("./routes/User")
const profileRoutes = require("./routes/Profile")
const paymentRoutes = require("./routes/Payments")
const courseRoutes = require("./routes/Course") 

const database = require("./config/database")
const cookieParser= require("cookie-parser")
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");

const fileUpload = require("express-fileupload");
const PORT = process.env.PORT;

// database connection
database.connect();

// middle-ware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"https://localhost:3000",
        credentials:true,
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)

// cludinary Connection
cloudinaryConnect();

// mount the routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/course",courseRoutes);

// defult route
app.get("/",(req,res) =>{
    return res.json({
        success: true,
        message : "Your server is Up and running"
    })
})

app.listen(PORT ,() =>{
    console.log(`Your App is running at Port Number ${PORT}`)
})