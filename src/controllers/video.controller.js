import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    let userIdQuery = {}
    if(userId){
        //TODO: test the feature with and without isValidObejectId and then accordingly make decision to add it everywhere. 
        if(isValidObjectId(userId)){ 
            userIdQuery = {owner: new mongoose.Types.ObjectId(userId)}
        } else{
            throw new ApiError(400, "Invalid user id!");
        }
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

    //Validate file uploads
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    if(!videoFileLocalPath){
        throw new ApiError("400", "Video file is required");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }

    if(
        [title, description].some((field) => 
            field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are necessary")
    }

    //upload on cloudinary and get resource
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile || !thumbnail){
        throw new ApiError(500, "Video file and thumbnail cloudinary upload error")
    }

    // const resource = await getVideoDuration(videoFile.url);
    // if(!resource){
    //     throw new ApiError(500, "Fetching resources from cloudinary went wrong")
    // }

    //create Video Schema document
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        title: title,
        description: description,
        duration: videoFile.duration //can diretly get the duration like this
    })

    if(!video){
        throw new ApiError(500, "Something went wrong while publishing video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200, 
            video, 
            "Video published successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400, "videoId is required in params")
    }

    const isValidvideoId = isValidObjectId(videoId);
    if(!isValidvideoId){
        throw new ApiError(400, "Invalid video id. The video doesnot exist")
    }

    try {
            const video = await Video.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(videoId)
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
                }
            ])
        
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    video[0],
                    "Video fetched successfully"
                )
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong with fetching video");
    }         
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    /* 
    * -----
    * Algo:
    * -----
    * 1. get video id from req.params
    * 2. get title, description from req.body
    * 3. title and descriotion field cannot be left empty
    * 4. thumbnail validation; if present, update and delete old url; else, $set old thumbnail url and dont delete old url
    * 5. findById video and $set: thumbnail, title, description; weather they are actually differnt from old one or not should be validatied before making the api call
    */

    try {
        const { videoId } = req.params
        if(!videoId){
            throw new ApiError(400, "Error:VideoId missing in params")
        }

        const isValidvideoId = isValidObjectId(videoId);
        if(!isValidvideoId){
            throw new ApiError(400, "Invalid video id. The video doesnot exist")
        }
    
        const { title, description } = req.body
        if(
            [title, description].some(
                (field)=> field?.trim()==="")
        ){
            throw new ApiError(400, "title and description cannot be left empty")
        }
        
        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(400, "Couldn't fetch video. It doesn't exist or deleted.")
        }
    
        let oldThumbnail;
        if(req.file){
            oldThumbnail = video.thumbnail;
            const thumbnailLocalPath = req.file.path;
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
            if(!thumbnail){
                throw new ApiError(500, "Server Error: Thumbnail couldn't be uploaded")
            }
            video.thumbnail = thumbnail.url;
        }
    
        video.title = title;
        video.description = description;
        const updateVideo = await video.save({validateBeforeSave: false});
        if(!updateVideo){
            throw new ApiError(500, "Couldn't save the updates on database")
        }
    
        if(oldThumbnail){
            //delete old thumbnail from cloudinary after uploading new one
            const deleteThumbnail = await deleteOnCloudinary(oldThumbnail);
            if(!deleteThumbnail){
                throw new ApiError(500, "Error: Old thumbnail couldn't be deleted.")
            }
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                updateVideo,
                "Video updated successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong updating video")
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        //TODO: delete video
        if(!videoId){
            throw new ApiError(400, "Error: VideoId is required")
        }

        const isValidvideoId = isValidObjectId(videoId);
        if(!isValidvideoId){
            throw new ApiError(400, "Invalid video id. The video doesnot exist")
        }
    
        const video = await Video.findById(videoId);
        if(!video){
            throw new ApiError(400, "Couldn't fetch video. It doesn't exist or deleted.")
        }
    
        const videoUrl = video.videoFile;
        const thumbnailUrl = video.thumbnail;
    
        const videoDeleted = await Video.findByIdAndDelete(videoId);
        if(!videoDeleted){
            throw new ApiError(500, "Error: Video not deleted")
        }
    
        const deleteVideoUrl = await deleteOnCloudinary(videoUrl);
        const deleteThumbnailUrl = await deleteOnCloudinary(thumbnailUrl);
    
        if(!deleteVideoUrl || !deleteThumbnailUrl){
            throw new ApiError(500, "Error: Couldn't delete video or thumbnailnfrom cloudinary")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videoDeleted,
                "Video deleted successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong deleting video")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params
        if(!videoId){
            throw new ApiError(400, "Error: VideoId is required")
        }

        const isValidvideoId = isValidObjectId(videoId);
        if(!isValidvideoId){
            throw new ApiError(400, "Invalid video id. The video doesnot exist")
        }
    
        const video =  await Video.findByIdAndUpdate(
            videoId, {
                $set: {
                    isPublished: !isPublished
                }
            },
            {
                new: true
            }
        )
    
        if(!video){
            throw new ApiError(500, "Something went wrong with toggle publish")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Published toggled successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while toggling video publish")
    }
})

const updateView = asyncHandler(async(req, res) => {
    /* 
    * Validate the view criteria from the frontend
    * make api call with userId(JWT auth), videoId(param) to update view
    * add the view count in the video model
    * add the video id in the user model watch history
    */
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Error: VideoId is required")
    }

    const isValidvideoId = isValidObjectId(videoId);
    if(!isValidvideoId){
        throw new ApiError(400, "Invalid video id. The video doesnot exist")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { 
                views: 1 
            }
        },
        {
            new: true
        }
    )
    
    if(!video){
        throw new ApiError(500, "Error: View couldn't be updated")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $push: {
                watchHistory: videoId
            }
        },
        {
            new: true
        }
    )

    if(!user){
        throw new ApiError(500, "Error: Wathc history couldn't be updated")
    }

    const responseData = {
        video,
        user
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            201,
            responseData,
            "View increased and watchHistory updated successfully"
        )
    )
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
