import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message: "ok"
    // })

//Step to register user:
    // get user details from the frontend
    // validation - not empty
    // check if user already exist: username, email
    // check if files: avatar and cover images 
        // upload them to cloudinary if available. avatar
        // get the url from the cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from the response
    // check for user creation 
    // return response else error    
    // if(fullName === "") {
    //         throw new ApiError(400, "Fullname is required")
    // }

    const {fullName, email, username, password} = req.body;
    // console.log("email: ", email);
    if(
        [fullName, email, username, password].some((field) =>
            field?.trim()==="")
        ) {
            throw new ApiError(400, "All fields are required")
        }
    
    const existedUser =  User.findOne({
        $or: [{ username }, { email }] //checks if anyone of the filed already exists
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //multer provides the access to req.files after we pu the middleware in the user.routes
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.tolowercase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUesr, "User registered successfully")
    )

})

export {
    registerUser,
}

/* 
1. accept user information which will be POSTed by the user through frontend
2. Upload the inforamtion on the database
3. Accept password and encrypt them and then store them
4. create tokens for the user and store them
5. return success message to the user
*/ 