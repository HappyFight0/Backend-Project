import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials: true
}))

app.use(express.json({limit: "1kb"}))

app.use(express.urlencoded({
    extended: true, //extended is for option: objects insider objects
    limit: "16kb"
}))

app.use(express.static("public")) //to acess assets like images

//cookie-parser is used to perform CRUD on cookies of the browser
app.use(cookieParser())


export { app };

