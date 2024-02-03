import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    try {
        const userId = req.user?._id
            if(!userId){
                throw new ApiError(400, "User not logged in")
            }
    
        const stats = await Video.aggregate([
            {
                $match: {
                    owner: userId
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: "$views" },
                    totalVideos: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$isPublished", true] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "subscriptions", 
                    localField: "owner",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $addFields: {
                    totalSubscribers: { $size: "$subscribers" }
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $addFields: {
                    totalLikes: { $size: "likes" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalViews: 1,
                    totalVideos: 1,
                    totalSubscribers: 1,
                    totalLikes: 1
                }
            }
        ])
    
        if(!stats){
            throw new ApiError(500, "Error: Couldn't fetch stats")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                stats,
                "Stats fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong fetching stats")
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    try {
        const userId = req.user?._id
        if(!userId){
            throw new ApiError(400, "User not logged in")
        }
    
        const videos = await Video.find({
            owner: userId,
            isPublished: true
        })
    
        if(!videos){
            throw new ApiError(500, "Couldn't fetch videos")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Videos fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error.message || "Something went wrong fetching videos")
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }