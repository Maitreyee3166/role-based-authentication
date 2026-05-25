require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const DBCon = require('./app/config/db')
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');


const app = express();

DBCon();


app.use(cors());


app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(express.static('public'));


app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRECT || 'hellonode', 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 
    }
}))


app.use(express.json());
app.use(express.urlencoded({extended : true}));


const router = require('./app/routes/user.route');
app.use(router);


const PORT = 3006;

app.listen(PORT, () => {
    console.log(`Server is listing on PORT ${PORT}`);
    
});
