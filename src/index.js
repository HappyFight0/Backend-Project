import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

//.env configuration
dotenv.config({
    path: "./.env" // "./env" works as well"
})

//database connection
connectDB()
.then(() =>{
    app.on("error", (error) => {
        console.log("ERRR: ", error);
        throw error;
    });

    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at port : 
        ${process.env.PORT}`);
    });
}).catch((err) => {
    console.log("MONGODB Connection failed!", err);
});












// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"
// ( async() => {
//     try {
//         //connect to the database
//         await mongoose.connect(`${ process.env.MONGODB_URI}/${DB_NAME}`)
//         // if db is connected but app showing error; to check that we will wirte below code
//         app.on("error", (error) => {
//             console.log("ERRR: ", error);
//             throw error
//         })
//         //listen to the server
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })
//     //if any database connection error then catch here
//     } catch (error) {
//         console.log("ERROR: ", error)
//         throw err
//     }
// })()