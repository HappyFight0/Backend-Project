// A utility higher order function that takes other functions
//as a argument and handles them asynchronously. 
// There are two ways to do this: 
// - promise 
// - try catch 
// Both these methods use the higher order function.

const asyncHandler = (requestHandler) => {
     (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
     }
}

export {asyncHandler}


//Working of below line:
/* 
    const asyncHandler = () => {}
    const aysncHandler = (func) => {}
    const asyncHandler = (func) => {() => {}} //function inside a function
    const asyncHandler = (func) => async () => {}
*/

//Another way to do the above code:
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

