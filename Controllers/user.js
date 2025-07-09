const User = require('../Model/user');
const bcrypt = require('bcrypt');
const { generateTokens, verifyRefreshToken } = require('../utill')
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
}

const handlePostLogin = async (req, res, next) => {
    const deviceId = uuidv4();
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
        return res
            .status(200)
            .cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 15 * 60 * 1000,
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .cookie('deviceId', deviceId, {
                httpOnly: false,
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json({
                status: true,
                message: "The user logged in successfully",
                user
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

// const handleUpdateUser = async (req, res, next) => {
//     try {
//         const userId = req.user.id; // Assuming you have user authentication middleware
//         const {
//             fullname, phonenumber, dateofbirth, gender, streetaddress, city, State, Postal, Country
//         } = req.body;

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 status: false,
//                 message: "User not found."
//             });
//         }

//         // Update user fields
//         user.fullname = fullname || user.fullname;
//         user.phonenumber = phonenumber || user.phonenumber;
//         user.dateofbirth = dateofbirth ? new Date(dateofbirth) : user.dateofbirth;
//         user.gender = gender || user.gender;
//         user.streetaddress = streetaddress || user.streetaddress;
//         user.city = city || user.city;
//         user.State = State || user.State;
//         user.Postal = Postal || user.Postal;
//         user.Country = Country || user.Country;

//         await user.save();

//         return res.status(200).json({
//             status: true,
//             message: "User updated successfully.",
//             user: {
//                 fullname: user.fullname,
//                 email: user.email,
//                 phonenumber: user.phonenumber,
//                 dateofbirth: user.dateofbirth,
//                 gender: user.gender,
//                 streetaddress: user.streetaddress,
//                 city: user.city,
//                 State: user.State,
//                 Postal: user.Postal,
//                 Country: user.Country
//             }
//         });

//     } catch (error) {
//         console.error("Update user error:", error);
//         return res.status(500).json({
//             status: false,
//             message: "An internal server error occurred."
//         });
//     }
// };

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
    handleGetLogin, handlePostLogin, handleGetSignUp, handlePostSignUp, getUserDetails, logoutUser
};