import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    try {
        //TODO: get all comments for a video
        const {videoId} = req.params
        const {page = 1, limit = 10} = req.query
    
        if(!videoId){
            throw new ApiError(400, "videoId is required in params")
        }
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Error: Invalid video id")
        }
    
        const comments = await Comment.aggregate([
            {
                $match: {
                    video: mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $skip: (page-1)*limit //non-synchronous pagination
            },
            {
                $limit: limit,
            }
        ])
    
        if(!comments){
            throw new ApiError(500, "Error: Couldn't fetch commnets")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.status || 500, error?.message || "Something went wrong fetching comments")
    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    try {
        const { videoId } = req.params
        const { content } =req.body
    
        if(
            [videoId, content].some(
                (field)=>field.trim()===""
            )   
        ) {
            throw new ApiError(400, "Error: videoId and content cannot be empty")
        }
    
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Error: Invalid videoId")
        }
    
        const comment = await Comment.create(
            {
                content,
                video: videoId,
                owner: req.user?._id
            }
        )
    
        if(!comment){
            throw new ApiError(500, "Couldn't add comment")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment added successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.status || 500, error?.message || "Something went wrong adding comment")
    }

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    //only owner has permission to update
    try {
        const { content } = req.body
        const { commentId } = req.params
        if(!content || !commentId){
            throw new ApiError(400, "Error: content & commentId empty")
        }
    
        if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Error: Invalid commentId")
        }
    
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content
                }
            }
        )
    
        if(!comment){
            throw new ApiError(500, "Couldn't update comment")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment updated successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.status || 500, error?.message || "Something went wrong updating comment")
    }

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    //validate comment owner or video owner. only these two have permission to delete
    try {
        const { commentId } = req.params
        if(!commentId){
            throw new ApiError(400, "Error: commentId empty")
        }
    
        if(!isValidObjectId(commentId)){
            throw new ApiError(400, "Error: Invalid commentId")
        }
    
        const comment = await Comment.findByIdAndDelete(commentId)
        if(!comment){
            throw new ApiError(500, "Couldn't delete comment")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment deleted successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.status || 500, error?.message || "Something went wrong deleting comment")
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
