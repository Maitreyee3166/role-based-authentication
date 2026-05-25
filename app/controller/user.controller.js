const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sendEmail = require('../utils/sendEmail');

const OTPModel = require('../models/otp');

class UserController {

    async CheckAuth(req, res, next) {
        try {
            if (req.user) {
                next()
            } else {
                res.redirect('/login');
            }
        } catch (err) {
            console.log(err)
        }
    }

    registerView(req, res) {
        return res.render("register");
    }

    async register(req, res) {

        try {
            const { name, email, password, role } = req.body;

            if (!name || !email || !password || !role) {

                console.log("All field required");
                return res.redirect("/register");
            }

            const existUser = await User.findOne({ email });

            if (existUser) {

                console.log("User already exist");
                return res.redirect("/register");
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            const userdata = new User({
                name,
                email,
                password: hashPassword,
                role
            });

            const newUser = await userdata.save();

            await sendEmail(req, newUser);

            if (newUser) {
                // return res.render("otpverify", {
                //     message: "OTP sent successfully in your Email",
                // });
                console.log("User created successfully");
                return res.redirect("/verify-otp");
            }

        } catch (error) {

            return res.redirect("/register");
        }
    }

    loginView(req, res) {
        return res.render("login");
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {

                console.log("All field required");
                return res.redirect("/login");
            }

            const existingUser = await User.findOne({ email });

            if (!existingUser) {

                console.log("User not exist");
                return res.redirect("/login");
            }

            const isMatch = await bcrypt.compare(password, existingUser.password);

            if (!isMatch) {

                console.log("Invalid Credentials");
                return res.redirect("/login");
            }

            if (!existingUser.isVerified) {

                console.log("User not varified");
                return res.redirect("/login");

            } else {

                const token = jwt.sign(
                    {
                        id: existingUser._id,
                        name: existingUser.name,
                        email: existingUser.email,
                        role: existingUser.role
                    },
                    process.env.JWT_SECRECT,
                    { expiresIn: "1d" },
                );

                if (token) {
                    res.cookie("token", token);

                    if (existingUser.role == 'admin') {
                        return res.redirect("/dashboard");
                    } else {
                        return res.redirect("/user/dashboard");
                    }

                } else {
                    console.log("invalid credentials");
                    return res.redirect("/login");

                }
            }

        } catch (error) {

            console.log("error");
            return res.redirect("/login");
        }
    }

    verifyView(req, res) {
        return res.render("otpverify", {
            message: "OTP sent successfully",
        });
    }

    async verify(req, res) {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {

                console.log("All field required");
                return res.redirect("/verify-otp");
            }

            const existUser = await User.findOne({ email });

            if (!existUser) {

                console.log("User not exist");
                return res.redirect("/register");
            }

            if (existUser.isVerified) {

                return res.redirect("/login");
            }

            const emailVerification = await OTPModel.findOne({ userId: existUser._id, otp })

            if (!emailVerification) {
                if (!existUser.isVerified) {

                    await sendEmail(req, existUser);
                    return res.redirect("/verify-otp");
                }

                return res.redirect("/verify-otp");
            }

            const currentTime = new Date();

            const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000)

            if (currentTime > expirationTime) {
                await sendEmail(req, existUser);
                return res.redirect("/verify-otp");
            }

            existUser.isVerified = true;
            await existUser.save()

            await OTPModel.deleteMany({ userId: existUser._id });

            return res.redirect("/login");

        } catch (error) {

            console.log(error.message);
            return res.redirect("/verify-otp");
        }
    }

    resendotp(req, res) {

        return res.render("resendotp");
    }

    async resendotpCreate(req, res) {
        try {
            const { email } = req.body;

            if (!email) {

                console.log("Email is required");
                return res.redirect("/resend-otp");
            }

            const existUser = await User.findOne({ email });

            if (!existUser) {

                console.log("User not exist");
                return res.redirect("/register");
            }

            await sendEmail(req, existUser);

            if (existUser) {

                return res.render("otpverify", {
                    message: "OTP sent successfully in your Email",
                });
               
            }
        } catch (error) {

            console.log(error.message);
            return res.redirect("/resend-otp");
        }
    }

    async dashboard(req, res) {
        try {
            let allUser = await User.find({ role: "user" });

            res.render('dashboard', {
                data: req.user,
                userdata: allUser
            })

        } catch (error) {
            return res.render("/register");
        }

    }

    userDashboard(req, res) {
        res.render('userdashboard', {
            data: req.user
        })
    }

    logout(req, res) {
        res.clearCookie('token');
        res.redirect('/login');
    }

}

module.exports = new UserController();
