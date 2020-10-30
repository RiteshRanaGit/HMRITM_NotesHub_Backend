const express = require('express');
const mongooes = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const notes = require('./routes/api/notes');
//DB configur

const dbHnr =  require('./config/keys').mongoURI;

// connect to mongoDb

mongooes
    .connect(dbHnr,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=> console.log('connect to database'))
    .catch(err =>console.log(err));


const app = express();

app.get('/', (req, res) => res.send("hello hi how are you "));

//use routes 

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/notes', notes);


const port = process.env.PORT  || 5000;

 app.listen(port, console.log(`server is running on port ${port}`));