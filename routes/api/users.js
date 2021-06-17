const express = require('express');
const bcrypt = require('bcryptjs'); 
const router = express.Router();
const keys = require('../../config/keys');
const roles = require('../../config/role');

const jwt = require('jsonwebtoken');
const passport = require('passport');

// lodad moddles
const User = require('../../models/User');
const ClassRoom = require('../../models/ClassRoom');
const Subject = require('../../models/Subject');
const ClassNotice = require('../../models/ClassNotice');

//Load Input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation//login');
const { default: validator } = require('validator');  // ye aplne aap aay hai 


//Load user model


// @route   GET api/user/test
// @decs    Test user route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " user is working"}));

// @route   post api/user/register
// @decs    Register  user 
// @access  Public

router.post('/register', (req, res) => {
    
    // check validation
    const {errors, isValid } = validateRegisterInput(req.body);
    
    if(isValid === false){
        
        return res.status(400).json(errors);
    }
    

    User.findOne({email: req.body.email})
    .then(user => {
        if(user){
            errors.email = "email already exist";
            return res.status(400).json(errors);
        } else {
            console.log("befor new user")
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                enroll: req.body.enroll,
                password: req.body.password,
                yearOfAdmission: req.body.yearOfAdmission,
                branch: req.body.branch,
                section: req.body.section,
                role: roles.student
            });
            console.log("after new user")
            bcrypt.genSalt(10,(err, salt) =>{
                bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                })
            })
        }
    })
})

// @route   post api/user/login
// @decs    user login / Return jwt token 
// @access  Public

router.post('/login', (req, res) => {

    // check validation
    const {errors, isValid } = validateLoginInput(req.body);
    
    if(isValid === false){
        
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    const role = roles.student;
    
    console.log(email);
    console.log(password);

    //find user by email
    User.findOne({email})
    .then(user => {
        // console.log(user);
        if(!user){
            errors.email = "User not Found!"
            return res.status(400).json(errors);
        }

        // check password
        bcrypt.compare(password, user.password)
        .then( ismatch => {
            if(ismatch){
                //user match
                const payload = {
                    id: user.id,
                    name: user.name,
                    enroll: user.enroll,
                    email: user.email,
                    year: user.yearOfAdmission,
                    section: user.section,
                    branch: user.branch,
                    role: user.role
                } // create jwt payload
                // sign token 
                jwt.sign(
                    payload,
                    keys.secretOrKey, 
                    { expiresIn: 3600},
                    (err, token) =>{
                        res.json({
                            sucess: true,
                            token: 'bearer ' + token
                        });
                    });

            } else {
                errors.password = "Password is incorrect"
                return res.status(400).json(errors);
            }
            
        })
        
    })
});

// @route   post api/user/current
// @decs    Return current user 
// @access  Private

router.get('/current',passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        enroll: req.user.enroll,
        email: req.user.email,
        year: req.user.yearOfAdmission,
        branch: req.user.branch
        
    });
});


// @route   post api/user/Classroom
// @decs    Return current user 
// @access  Private

router.get('/classroom',passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        const errors = {};
        const userYear = req.user.yearOfAdmission;
        const branch = req.user.branch;
        const section = req.user.section;
        const currentmonth = new Date().getMonth();
        const currentyear = new Date().getFullYear();

        // calculate current year ex first second third and fourth
        const yearcal = ( currentyear, userYear, currentmonth) =>{
            if(currentmonth >= 8){
                return currentyear - userYear  +1 ;
            } else{
                return currentyear -  userYear  ;
            }
        }
        const year= yearcal(currentyear, userYear, currentmonth);
        

        console.log(year)
        // calculate current semester 
        const semestercalulation = (currentmonth, year) => {
            
            if(currentmonth>=8){
                return year*2-1;
            } else {
                return year*2;
            }
           
        }
        const semester = semestercalulation(currentmonth, year);
       
        console.log(semester);
        console.log(branch);

        //user: req.user.branch, user: req.user.section
        ClassRoom
        .findOne({
            year,
            branch,
            semester,
            section
        })           
        .then(classRoom =>{
        if(!classRoom){
            errors.classRoomis = "There is no class found"
            return res.status(404).json(errors);
        }
        const classId = classRoom.id;
        console.log(classId);
        Subject.
        find({
            classId
        })
        .then(subject =>{
            if(!subject){
                errors.subject = "Subject not found";
                return res.status(404).json(errors);
            }
            return res.json(subject);
        }).catch(err => res.status(400).json(err));

        
    })
    .catch(err => res.status(400).json(err));
    
});

router.get('/classroomnotice',passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        const errors = {};
        const userYear = req.user.yearOfAdmission;
        const branch = req.user.branch;
        const section = req.user.section;
        const currentmonth = new Date().getMonth();
        const currentyear = new Date().getFullYear();

        // calculate current year ex first second third and fourth
        const yearcal = ( currentyear, userYear, currentmonth) =>{
            if(currentmonth >= 8){
                return currentyear - userYear  +1 ;
            } else{
                return currentyear -  userYear  ;
            }
        }
        const year= yearcal(currentyear, userYear, currentmonth);
        

        console.log(year)
        // calculate current semester 
        const semestercalulation = (currentmonth, year) => {
            
            if(currentmonth>=8){
                return year*2-1;
            } else {
                return year*2;
            }
           
        }
        const semester = semestercalulation(currentmonth, year);
       
        console.log(semester);
        console.log(branch);

        //user: req.user.branch, user: req.user.section
        ClassRoom
        .findOne({
            year,
            branch,
            semester,
            section
        })           
        .then(classRoom =>{
        if(!classRoom){
            errors.classRoomis = "There is no class found"
            return res.status(404).json(errors);
        }
        const classId = classRoom.id;
        console.log(classId);
        ClassNotice.
        find({
            classId,
        })
        .then(classnotice =>{
            if(!classnotice){
                errors.classnotice = "this notice not found";
                return res.status(404).json(errors);
            }
            return res.json(classnotice);
        }).catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
    
});
module.exports = router;