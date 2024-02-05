import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params
        //TODO: toggle like on video
        if(!videoId){
            throw new ApiError(400, "videoId is required in params")
        }
    
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid video id. The video doesnot exist")
        }
    
        const like = await Like.findOne({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    
        let response = {}
        if(like){
            const deleteLike = await Like.findByIdAndDelete(like._id)
            if(!deleteLike){
                throw new ApiError(500, "Error: Couldn't delete like")
            }
            response["data"]=deleteLike;
            response["message"] = "Like removed successfully"
        } else{
            const addLike = await Like.create(
                {
                    video: videoId,
                    likedBy: req.user?._id
                }
            )
            if(!addLike){
                throw new ApiError(500, "Error: Couldn't add like")
            }
            response["data"]=addLike;
            response["message"] = "Like added successfully"
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response.data,
                response.message
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong toggling like")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params
        //TODO: toggle like on comment
        if(!commentId){
            throw new ApiError(400, "commentId is required in params")
        }
    
        if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Invalid comment id")
        }
    
        const like = await Like.findOne({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    
        let response = {}
        if(like){
            const deleteLike = await Like.findByIdAndDelete(like._id)
            if(!deleteLike){
                throw new ApiError(500, "Error: Couldn't delete like")
            }
            response["data"]=deleteLike;
            response["message"] = "Like removed successfully"
        } else{
            const addLike = await Like.create(
                {
                    comment: commentId,
                    likedBy: req.user?._id
                }
            )
            if(!addLike){
                throw new ApiError(500, "Error: Couldn't add like")
            }
            response["data"]=addLike;
            response["message"] = "Like added successfully"
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response.data,
                response.message
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong toggling like")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    try{
        const {tweetId} = req.params
        //TODO: toggle like on tweet
        if(!tweetId){
            throw new ApiError(400, "tweetId is required in params")
        }
    
        if(!isValidObjectId(tweetId)){
            throw new ApiError(400, "Invalid tweet id")
        }
    
        const like = await Like.findOne({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    
        let response = {}
        if(like){
            const deleteLike = await Like.findByIdAndDelete(like._id)
            if(!deleteLike){
                throw new ApiError(500, "Error: Couldn't delete like")
            }
            response["data"]=deleteLike;
            response["message"] = "Like removed successfully"
        } else{
            const addLike = await Like.create(
                {
                    tweet: tweetId,
                    likedBy: req.user?._id
                }
            )
            if(!addLike){
                throw new ApiError(500, "Error: Couldn't add like")
            }
            response["data"]=addLike;
            response["message"] = "Like added successfully"
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response.data,
                response.message
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong toggling like")
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const userId = req.user?._id;
        const like = await Like
            .find({
                likedBy: userId,
                video: {
                    $exists: true
                }
            })
            .populate("video")
    
        if(!like){
            throw new ApiError(500, "Error: Couldn't fetch liked videos")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                like,
                "Liked Videos fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong fetching liked videos")
    }

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}