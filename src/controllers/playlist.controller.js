import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const {name, description} = req.body
        //TODO: create playlist
        if(
            [name, description].some(
                (field) => field?.trim()===""
            )
        ){
            throw new ApiError(400, "Error: Name and description cannot be empty")
        }
    
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user?._id
        })
    
        if(!playlist){
            throw new ApiError(500,"Error: Playlist couldn't be created!")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                201,
                playlist,
                "Playlist created successfully!"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong creating playlist")
    } 
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const {userId} = req.params
        //TODO: get user playlists
        if(!userId){
            throw new ApiError(400, "Error: userId cannot be empty")
        }
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Error: Invalid user id")
        }
    
        const playlists = await Playlist.find({owner: new mongoose.Types.ObjectId(userId)})
        if(!playlists){
            throw new ApiError(500, "Error: Couldn't fetch playlist")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                playlists,
                "Playlists fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong fetching the playlists")
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
        //TODO: get playlist by id
        if(!playlistId){
            throw new ApiError(400, "Error: playlistId cannot be empty")
        }
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Error: Invalid playlist id")
        }
    
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new ApiError(500, "Couldn't fetch the playlist")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong fetching playlist")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params
        if(
            [playlistId, videoId].some(
                (field) => field?.trim()===""
            )
        ){
            throw new ApiError(400, "Error: playlistId and videoId cannot be empty")
        }
        if(
            [playlistId, videoId].some(
                (field) => !isValidObjectId(field)
            )
        ){
            throw new ApiError(400, "Error: Invalid playlistId and videoId")
        }
    
        const updatePlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push: {
                    videos: videoId
                }
            },
            {
                new: true
            }
        )
    
        if(!updatePlaylist){
            throw new ApiError(500, "Video Couldn't be added")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200, 
                updatePlaylist, 
                "Video added successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong adding video")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId, videoId} = req.params
        if(
            [playlistId, videoId].some(
                (field) => field?.trim()===""
            )
        ){
            throw new ApiError(400, "Error: playlistId and videoId cannot be empty")
        }
        if(
            [playlistId, videoId].some(
                (field) => !isValidObjectId(field)
            )
        ){
            throw new ApiError(400, "Error: Invalid playlistId and videoId")
        }
    
        const updatePlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull: {
                    videos: videoId
                }
            },
            {
                new: true
            }
        )
    
        if(!updatePlaylist){
            throw new ApiError(500, "Video Couldn't be deleted")
        }
    
        return res
        .status(201)
        .json(
            new ApiResponse(
                200, 
                updatePlaylist, 
                "Video deleted successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong deleting video")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
        if(!playlistId){
            throw new ApiError(400, "Error: playlistId cannot be empty")
        }
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Error: Invalid playlist id")
        }
    
        const playlist = await Playlist.findByIdAndDelete(playlistId)
        if(!playlist){
            throw new ApiError(500, "Couldn't delete the playlist")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist deleted successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong deleting playlist")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
        const {name, description} = req.body
    
        if(
            [name, description, playlistId].some(
                (field) => field?.trim()===""
            )
        ){
            throw new ApiError(400, "Error: Name, description, playlistId cannot be empty")
        }
    
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400, "Error: Invalid playlist id")
        }
    
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set: {
                    name,
                    description
                }
            },
            {
                new: true
            }
        )
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                playlist, 
                "Playlist updated successfully"
            )
        )
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong updating playlist")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
