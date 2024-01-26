import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    let userIdQuery = {}
    if(userId){
        userIdQuery = {owner: new mongoose.Types.ObjectId(userId)}
    }

    let searchQuery = {}
    if(query){
        searchQuery = {
            index: "getAllVideos", //created search index from the website using visual editor named: "getAllVideos". more detail on website
            text: {
                query: query,
                path: ["name", "description"], // Fields to search in
              },
              regex: {
                pattern: `^.*${searchText}.*`, //mongo instructed to add caret (^) at the beginning for M0 free cluster or M2/M5 shared cluster
                options: "i", // Case-insensitive search
              }
        }
    }
    
    let sortOptions = {}
    if(sortBy){
        if(sortBy !== "views" && sortBy !== "title" && sortBy !== "createdAt"){
            throw new ApiError(400, "Invalid sortBy criteria. Possible sortBy criterias are: `views`, `titles`, `createdAt`.", )
        }

        if(!sortType){
            throw new ApiError(400, "SortType missing")
        }

        if(sortType!== 1 && sortType!==-1){
            throw new ApiError(400, "Invalid sortType criteria. Give 1 or -1")
        }

        sortOptions[sortBy]=sortType;
    }

    try {
        const videos = await Video.aggregate([
            {
                $match: {
                    ...userIdQuery //if this query is empty then this stage will be skipped after using the spread operator
                }
            },
            {
                $search: {
                    ...searchQuery //if this query is empty then this stage will be skipped after using the spread operator
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "owner",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $sort: { 
                    ...sortOptions ////if this query is empty then this stage will be skipped after using the spread operator
                    }
            },
            {
                $skip: (page-1)*limit //non-synchronous pagination
            },
            {
                $limit: limit,
            }
        ])

    return res
        .status(200)
        .json(
        new ApiResponse(
            200,
            videos,
            "All videos fetched successfully"
        )
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong with Video Aggregation")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

const updateView = asyncHandler(async(req, res) => {
    /* 
    * Validate the view criteria from the frontend
    * make api call with userId(JWT auth), videoId(param) to update view
    * add the view count in the video model
    * add the video id in the user model watch history
    */
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateView
}
