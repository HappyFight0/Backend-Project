import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params
        // TODO: toggle subscription
        if(!channelId){
            throw new ApiError(400, "Error: Channel Id missing")
        }
    
        let response = {};
        const channel = await Subscription.find({channel: channelId, subscriber: req.body?._id});
        if(channel){
            const deleteSubs = await Subscription.findByIdAndDelete(channel._id);
            if(!deleteSubs){
                throw new ApiError(500, "Error: Subs not deleted")
            }
            response["subscription"] = deleteSubs;
            response["message"]= "Subscription removed successfully";
        } else{
            const addSubs = await Subscription.create({
                subscriber: req.body?._id,
                channel: channelId
            })
            if(!addSubs){
    
            }
            response["subscription"] = addSubs;
            response["message"]= "Subscription added successfully";
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response.subscription,
                response.message
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong togging subs")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const {channelId} = req.params
        if(!channelId){
            throw new ApiError(400, "Error: Channel Id missing")
        }
    
        const subscribers = await Subscription.find({ channel: channelId });
        //todo: check case1: when there are no subscriber, case 2: when there is error while fetching the subscriber
        if(!subscribers){
            throw new ApiError(500, "Error: Couldn't fetch the subscribers")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "Subscribers fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong fetching subscribers")
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const {subscriberId} = req.params
        if(!subscriberId){
            throw new ApiError(400, "Error: Subscriber Id missing")
        }
    
        const channelsSubscribed = await Subscription.find({ subscriber: subscriberId });
        //todo: check case1: when there are no subscriber, case 2: when there is error while fetching the subscriber
        if(!channelsSubscribed){
            throw new ApiError(500, "Error: Couldn't fetch the channelsSubscribed")
        }
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelsSubscribed,
                "Channels subscribed fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong fetching channels subscribed")
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}