import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js"

const router = Router();

router.route("/register").post(
    upload.fields( //stores images in the local storage
        [
            {
                name: "avatar", //frontend filed name should be same
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]
    ),
    registerUser);

export default router;