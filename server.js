const express = require('express');
const mongooes = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const department = require('./routes/api/department');
const profile = require('./routes/api/profile');
const classrooms = require('./routes/api/classrooms');
const notes = require('./routes/api/notes');
const subject = require('./routes/api/subject');
const classnotice = require('./routes/api/classnotice');
const subjectnotice = require('./routes/api/subjectnotice');


require('dotenv').config();
const cors = require('cors');
const multer = require('multer');



const app = express();

//Body parser Middleware`
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); 

app.use(cors());


//DB configur
const dbHnr =  require('./config/keys').mongoURI;

// connect to mongoDb

mongooes
    .connect(dbHnr,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=> console.log('connect to database'))
    .catch(err =>console.log(err));


app.get("/",(req,res)=>{
    res.send("HMRITM NotesHub API");
})

//passport middleware 
app.use(passport.initialize());

//Passport config 
require('./config/passport')(passport);

//use routes 

app.use('/api/users', users);
app.use('/api/department', department);
app.use('/api/profile', profile);
app.use('/api/classrooms', classrooms);
app.use('/api/notes', notes);
app.use('/api/subject', subject);
app.use('/api/classnotice', classnotice);
app.use('/api/subjectnotice', subjectnotice);



const port = process.env.PORT  || 5000;

 app.listen(port, console.log(`server is running on port ${port}`));