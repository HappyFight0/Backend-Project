import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    try {
        const { content } = req.body
        if(!content){
            throw new ApiError(400, "Error: content cannot be empty")
        }
    
        const tweet = await Tweet.create({
            owner: req.user?._id,
            content: content
        })
    
        if(!tweet){
            throw new ApiError(500, "Couldn't create tweet")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                tweet,
                "Tweet created successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong creating tweet")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    try {
        const { userId } = req.params
        if(!userId){
            throw new ApiError(400, "Error: userId is required")
        }
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Error: Invalid userId")
        }
        const userTweets = await Tweet.find({
            owner: new mongoose.Types.ObjectId(userId)
        })
    
        if(!userTweets){
            throw new ApiError(500, "Error: couldn't fetch tweets")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userTweets,
                "User tweets fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong fetching user tweets")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const { tweetId } = req.params
        const { content } = req.body
        if(!tweetId || !content){
            throw new ApiError(400, "Error: tweetId required")
        }
        if(!isValidObjectId(tweetId)){
            throw new ApiError(400, "Invalid tweet Id")
        }
    
        const updateTweet = await Tweet.findByIdAndUpdate(tweetId,
            {
                content
            },
            {
                new: true
            }
        )
    
        if(!updateTweet){
            throw new ApiError(500, "Couldn't update tweets")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                updateTweet,
                "Tweet updated successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong updating tweets")
    }
})


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    try {
        const { tweetId } = req.params
        if(!tweetId){
            throw new ApiError(400, "Error: tweetId required")
        }
        if(!isValidObjectId(tweetId)){
            throw new ApiError(400, "Invalid tweet Id")
        }
    
        const deleteTweet = await Tweet.findByIdAndDelete(tweetId)
        if(!deleteTweet){
            throw new ApiError(500, "Error: Couldn't delete tweets")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deleteTweet,
                "Tweet deleted successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong deleting tweets")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
