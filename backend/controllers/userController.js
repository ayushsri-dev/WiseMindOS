import userModel from "../models/userModel.js";
import imagekit from "../config/imagekit.js"
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'




const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}



// Route for user Login 
const loginUser = async (req, res) => {

    try {

        const { identifier, password } = req.body;

        const user = await userModel.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        });

        if (!user) {
            return res.json({ success: false, message: "User not found. Please Register first." })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id)
            return res.json({ success: true, message: "Login Successful", token, name: user.name, email: user.email, username: user.username, bio: user.bio, profile_picture: user.profile_picture })
        }
        else {
            return res.json({ success: false, message: "Invalid Credentials" })
        }


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

// Route for User register
const registerUser = async (req, res) => {

    try {

        const { name, email, password, username } = req.body;

        // Checking if there is the user exists in database with the same email.
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already Exists." })
        }

        const existsUsername = await userModel.findOne({ username });
        if (existsUsername) {
            return res.json({ success: false, message: "Username already taken. Try another !" })
        }


        // Validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email." })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must at least contain 8 characters." })
        }


        // Hashing User's password
        const salt = await bcrypt.genSalt(9)          // The higher the number the more time it will take to hash users password.
        const hashedPassword = await bcrypt.hash(password, salt)


        // Creating new User in database.
        const newUser = new userModel({
            name,
            username,
            email,
            password: hashedPassword
        })

        // Saving the new user in database.
        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token, bio: user.bio,  message: 'Account Created Successfully!' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

const updateUser = async (req, res) => {
    try {

        const userId = req.body.userId; // coming from middleware
        const { name, username, bio } = req.body;

        // Find current user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        let isModified = false;

        // If username is being changed → check uniqueness
        if (username && username !== user.username) {
            const existingUsername = await userModel.findOne({
                username,
                _id: { $ne: userId }
            });
            if (existingUsername) {
                return res.json({
                    success: false,
                    message: "Username already taken. Try another!"
                });
            }
        }

        // Update only allowed fields
        if (name && name !== user.name) {
            user.name = name;
            isModified = true;
        }
        if (username && username !== user.username) {
            user.username = username;
            isModified = true;
        }
        if (bio !== undefined && bio !== user.bio) {
            user.bio = bio;
            isModified = true;
        }


        if (!isModified) {
            return res.json({ success: true, message: "No changes made" });
        }

        // Save updated user
        const updatedUser = await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                username: updatedUser.username,
                bio: updatedUser.bio,
                email: updatedUser.email,
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


const updateUserProfilePic = async (req, res) => {
    try {

        const userId = req.body.userId; // coming from middleware

        // Find current user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        let isModified = false;


        const profile = req.files.profile && req.files.profile[0];
        // const cover = req.files.cover && req.files.cover[0];

        if(profile){
            const buffer = fs.readFileSync(profile.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            })

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '512'}
                ]
            })
            user.profile_picture = url;
            isModified = true;
        }
        
        // if(cover){
        //     const buffer = fs.readFileSync(cover.path)
        //     const response = await imagekit.upload({
        //         file: buffer,
        //         fileName: cover.originalname,
        //     })

        //     const url = imagekit.url({
        //         path: response.filePath,
        //         transformation: [
        //             {quality: 'auto'},
        //             {format: 'webp'},
        //             {width: '1280'}
        //         ]
        //     })
        //     user.cover_photo = url;
        //     isModified = true;
        // }


        if (!isModified) {
            return res.json({ success: true, message: "No changes made" });
        }

        // Save updated user
        const updatedUser = await user.save();

        res.json({
            success: true,
            message: "Profile Picture updated successfully",
            user: {
                profile_picture: updatedUser.profile_picture,
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};




export { loginUser, registerUser, updateUser, updateUserProfilePic }