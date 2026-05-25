const transporter = require("../config/emailconfig");
const OtpModel = require('../models/otp');

const sendEmail = async (req, user) => {

  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);


  // Save OTP in Database
  const gg = await new OtpModel({ userId: user._id, otp: otp }).save();


  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP - Verify your account",
    text: "",
    html: `<h1>Hello  ${user.name}</h1>
    <p>Your account has been created successfully. Login Details:</p>
    <h2 style="text-align: center; padding: 10px;">Email: ${user.email}</h2>
    <h2>Temporary OTP: ${otp}</h2>
    <p>Thank You,</p>
    <p>Admin Team </p>`
  })

  return otp;
}


module.exports = sendEmail;