import { Router } from "express";
import { logOutUser, loginUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser)

//secured Routes
router.route("/logout").post(verifyJWT, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;