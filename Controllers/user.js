const User = require('../Model/user');
const bcrypt = require('bcrypt');
const { generateTokens } = require('../utill')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const handleGetLogin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ status: false, message: "Unauthorized access" });
        }

        const user = await User.findOne({ email: req.user.email }).select("-password");

        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // console.log(user.)

        const formatted = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            dateofbirth: user.dateofbirth,
            profileType: user.profileType,
            isEmailVerified: user.isEmailVerified,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            gender: user.gender,
            dateofbirth: user.dateofbirth,
            secondary: user.secondary,
            website: user.website,
            accountholder: user.accountholder,
            accountnumber: user.accountnumber,
            bankname: user.bankname,
            ifsc: user.ifsc,
            address: user.address,
            city: user.city,
            country: user.country,
            postal: user.postal,
            state: user.state,
            profile: user.profile.map(img => {
                const base64 = img.data.toString('base64');
                return `data:${img.contentType};base64,${base64}`;
            })
        };

        return res.status(200).json({
            status: true,
            message: "User authenticated",
            user: formatted,
        });
    } catch (error) {
        console.error("Error in getUserDetails:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message,
        });
    }
}

const handlePostLogin = async (req, res, next) => {
    const deviceId = uuidv4();
    // debugger
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "The email and password required"
            });

        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "The user not exit"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Incorrect password"
            })
        }

        const { accessToken, refreshToken } = generateTokens(
            { uID: user.id, email: user.email },
            deviceId
        );

        // console.log(req.cookie)
        return res.status(200).json({
            status: true,
            message: "The user logged in successfully",
            user,
            accessToken,
            refreshToken,
            deviceId
        });


    } catch (error) {
        // console.error("Login error:", error);
        if (!res.headersSent) {
            return res.status(500).json({
                status: false,
                message: "Something went wrong!"
            })
        }
    }
};

const handleGetSignUp = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(
            {
                status: false,
                message: "Unauthorized user"
            }
        )
    }
    let useremail = req.user.email
    const user = await User.findOne({ email: useremail });
    return res.status(200).json({
        status: true,
        message: "authorized user",
        user
    })
};

const handlePostSignUp = async (req, res, next) => {
    try {
        const {
            fullname, email, password, confirmpassword
        } = req.body;

        const requiredFields = { fullname, email, password, confirmpassword };
        for (const [key, value] of Object.entries(requiredFields)) {
            if (!value) {
                return res.status(400).json({
                    status: false,
                    message: `${key} is required.`
                });
            }
        }


        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: "Account already exists. Please log in."
            });
        }

        if (
            password.length < 12 ||
            password.length > 14 ||
            !/[A-Z]/.test(password) ||
            !/[^a-zA-Z0-9]/.test(password)
        ) {
            return res.status(422).json({
                status: false,
                message: "Password must be 12-14 characters long, include one uppercase letter and one special character."
            });
        }

        if (password !== confirmpassword) {
            return res.status(400).json({
                status: false,
                message: "Password and Confirm Password must match."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            fullname,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        return res.status(200).json({
            status: true,
            message: "User registration successful.",
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            status: false,
            message: "An internal server error occurred."
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ status: false, message: "Unauthorized access" });
        }

        const user = await User.findOne({ email: req.user.email }).select("-password");

        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        return res.status(200).json({
            status: true,
            message: "User authenticated",
            user,
        });
    } catch (error) {
        console.error("Error in getUserDetails:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message,
        });
    }
};

const getUserDetailsById = async (req, res) =>{
    try {
        const {id} = req.params

        const userDetails = await User.findById({_id:id})

        if(!userDetails){
            res.status(404).json({
                message: "The user not found!"
            })
        }

        return res.status(200).json({
            message: 'The user data fetched successfully',
            userDetails
        })
        
    } catch (error) {
        res.status(500).json({
            message:'Something went wrong!',
        })
    }
}

const handleUpdateUser = async (req, res, next) => {
    try {
        // console.log(req.user)
        const userId = req.user.uID;
        // console.log(req.body)
        const {
            fullname, firstName, lastName, phone, secondary, website, dateofbirth, gender, address, city, state, postal, country, accountnumber,
            ifsc, accountholder, bankname
        } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found."
            });
        }

        // Update user fields
        user.fullname = fullname || user.fullname;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.secondary = secondary || user.secondary;
        user.website = website || user.website;
        user.dateofbirth = dateofbirth ? new Date(dateofbirth) : user.dateofbirth;
        user.gender = gender || user.gender;
        user.address = address || user.address;
        user.city = city || user.city;
        user.state = state || user.state;
        user.postal = postal || user.postal;
        user.country = country || user.country;
        user.accountnumber = accountnumber || user.accountnumber;
        user.ifsc = ifsc || user.ifsc;
        user.accountholder = accountholder || user.accountholder;
        user.bankname = bankname || user.bankname;

        console.log('accountnumber:', accountnumber, 'typeof:', typeof accountnumber);

        if (accountnumber !== undefined && accountnumber !== null) {
            user.profileType = 'Affiliate';
        }


        await user.save();

        return res.status(200).json({
            status: true,
            message: "User updated successfully.",
            user: {
                fullname: user.fullname,
                email: user.email,
                phonenumber: user.phonenumber,
                dateofbirth: user.dateofbirth,
                gender: user.gender,
                profileType: user.profileType,
                address: user.address,
                city: user.city,
                State: user.state,
                Postal: user.postal,
                Country: user.country
            }
        });

    } catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({
            status: false,
            message: "An internal server error occurred."
        });
    }
};

const updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.uID;

        // Ensure file is provided
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "No file provided",
            });
        }

        // Prepare image data
        const imageBuffer = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };

        // Update user profile with image
        const imageUpdate = await User.findByIdAndUpdate(
            userId,
            { profile: imageBuffer },
            { new: true }
        );

        if (!imageUpdate) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Image updated successfully",
            data: imageUpdate.profile // Optional: return updated profile image
        });
    } catch (error) {
        console.error("Error updating profile image:", error);
        return res.status(500).json({
            status: false,
            message: "Server error while updating profile image",
        });
    }
};

const getAllAffiliateUsersWithCar = async (req, res) => {
    try {

        const affiliates = await User.find({ profileType: 'Affiliate' })
        if (!affiliates) {
            return res.status(404).json({
                message: 'No data found!'
            })
        }

        return res.status(200).json({
            message: 'Data fetched successfully',
            affiliates
        })

    } catch (error) {
        console.error("Error updating profile image:", error);
        return res.status(500).json({
            status: false,
            message: "Server error while updating profile image",
        });
    }
}

const logoutUser = (req, res, next) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('deviceId');
    res.status(200).json(
        {
            status: false,
            message: "The user loged out successfull"
        }
    );
}

module.exports = {
    handleGetLogin, handlePostLogin, getUserDetailsById, handleGetSignUp, handlePostSignUp, handleUpdateUser, updateProfileImage, getUserDetails, logoutUser, getAllAffiliateUsersWithCar
};