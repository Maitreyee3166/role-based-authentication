const express = require('express')

const UserController = require('../controller/user.controller');
const AuthCheck = require('../middleware/authCheck');
const roleCheck = require('../middleware/roleCheck');


const router = express.Router();


router.get('/register', UserController.registerView); 
router.post('/register/create', UserController.register);

router.get('/verify-otp', UserController.verifyView);
router.post('/verify-otp/verify', UserController.verify);
router.get('/resend-otp', UserController.resendotp);
router.post('/otp/resend', UserController.resendotpCreate);


router.get('/login', UserController.loginView);
router.post('/login/create', UserController.login);

router.get('/dashboard', AuthCheck, roleCheck('admin'), UserController.dashboard);
router.get('/user/dashboard', AuthCheck, roleCheck('user'), UserController.userDashboard);

router.get('/logout', AuthCheck, UserController.CheckAuth, UserController.logout);




module.exports=router