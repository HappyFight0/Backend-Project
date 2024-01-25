import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save( { validateBeforeSave: false }) //so that mongoose doesn't apply validation of fields that has "required": true since we are only sending only one field that is referesh token

        return { accessToken, refreshToken }

    } catch{
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

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

    console.log("test:\n\n", req.body)
    const {fullName, email, username, password} = req.body;
    // console.log("email: ", email);
    if(
        [fullName, email, username, password].some((field) =>
            field?.trim()==="")
        ) {
            throw new ApiError(400, "All fields are required")
        }
    
    const existedUser =  await User.findOne({
        $or: [{ username }, { email }] //checks if anyone of the filed already exists
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    console.log(existedUser);

    //multer provides the access to req.files after we pu the middleware in the user.routes
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && 
        Array.isArray(req.files.coverImage) && 
        req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
    }
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) =>{
    //steps to login user
    /* 
    * if there is already a refresh token and it is coming from a certain endpoint then just create a new access token and provide access to the system
    * accept username/email and password
    * validations- not empty
    * username and password verify from the database
    * password ka verification mai encyption decryption ka concept aaega
    * if valid; refresh token and access token ka funda aayega
    * refresh token agar nahi hai toh dono new refresh aur acess token genearte karo 
    */

    /* 
    * req body -> data
    * username or email
    * find the user
    * password check
    * access and token
    * send secure cookies for tokens
    * response
    */

    console.log(req.body);
    const {email, username, password} = req.body;
    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    // console.log(username, "sdhsh", "password")

    const user = await User.findOne({
        $or: [{ username }, { email }] // $or is a mongodb operator
    })

    console.log(user);

    if( !user ){
        throw new ApiError(404, "User doesnot exists!");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if( !isPasswordValid ){
        throw new ApiError(401, "Invalid user credentials!");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //cookies
    const loggedInUser = await User.findById(user._id).select("-password -refereshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully!"
        )
    )
})

const logOutUser = asyncHandler(async(req, res) => {

    // console.log(req.user);
    try {
        const removedRefreshTokenUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            {
                new: true
            }
        )

        // console.log("test: \n\n", removedRefreshTokenUser);
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong with updating refreshToken")
    }
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200,{}, "User logged Out!"));
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if( !incomingRefreshToken ){
        throw new ApiError(400, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if( !user ){
            throw new ApiError(400, "Invalid request token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken". accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }

})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken
}

