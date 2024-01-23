import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true //this makes the user searchable efficient though it is expensive
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudinary URL where we store the assets
        required: true
    },
    coverImage: {
        type: String, //cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String, //password is always encrypted
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String,
    },
},
{ timestamps: true });

//create the password by encrypting it
//middleware- pre has access to the this object
//arrow fucntion doesnot have access to this object. So we will write function in normal way.
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) 
        return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//check the password when user is entering a password to login
//custom-method- methods too have access to the this object
userSchema.methods.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password, this.password)
}


//JWT token to provide the digital passport to the user which defines the privilege of the user like till what time they can access the website, what are the content they can access and so on.
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)