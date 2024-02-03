import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { status: "OK" },
                "Response fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong!");
    }
})

const userHealthcheck = asyncHandler(async (req, res) => {
    //TODO: build a user healthcheck response that simply returns the OK status as json when user is logged in with a message
    try {
        const user = req.user
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    status: "OK",
                    user
                },
                "Response fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, "Something went wrong!");
    }
})

export {
    healthcheck,
    userHealthcheck
    }
    