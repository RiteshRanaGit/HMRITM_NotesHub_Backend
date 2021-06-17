const express = require('express'); 
const router = express.Router();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// lodad moddles

// const User = require('../../models/User');
const ClassRoom = require('../../models/ClassRoom');

const ClassNotice = require('../../models/ClassNotice');


// keys
const roles = require('../../config/role');


// @route   GET api/profile/test
// @decs    Test profile route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " Notes is working"}));

// @route   GET api/classnotice
// @decs    Get notice of a class
// @access  private

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        const getClassNotice = (year, branch, section, semester) => {
            ClassRoom
            .findOne({
                year,
                branch,
                semester,
                section
            }) //user: req.user.branch, user: req.user.section
            .then( classRoom =>{
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
                        errors.classNotice = "Not Found";
                        return res.status(404).json(errors);
                    }
                    return res.json(classnotice);
                })
            })
            .catch(err => res.status(400).json(err));
        }
        if(req.user.role === roles.student){

            const userYear = req.user.yearOfAdmission;
            const branch = req.user.branch;
            const section = req.user.section;
            //const classNoticeTitle = req.body.classNoticeTitle;

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
            
    
            // console.log(year);
            // calculate current semester 
            const semestercalulation = (currentmonth, year) => {
                
                if(currentmonth>=8){
                    return year*2-1;
                } else {
                    return year*2;
                }
            
            }
            const semester = semestercalulation(currentmonth, year);
        
            // console.log(semester);
            // console.log(branch);
    
            getClassNotice  ( year, branch, section, semester);
        }
        else if (req.user.role === roles.department){
            const branch = req.body.branch;
            const year = req.body.year;
            const section = req.body.section;
            const semester = req.body.semester;
            //const classNoticeTitle = req.body.classNoticeTitle;
            getClassNotice  ( year, branch, section, semester);
        }

        
        
});

// @route   GET api/classnotice
// @decs    Get notice of a class
// @access  private

router.get('/department/:classId', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    const getDepartmentClassNotice = (classId) => {
        
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
        })
        .catch(err => res.status(400).json(err));
    }
    if(req.user.role === roles.student){
        return res.status(400).json(errors);       
    }
    else if (req.user.role === roles.department){
        const classId = req.params.classId;
        //const classNoticeTitle = req.body.classNoticeTitle;
        getDepartmentClassNotice  (classId);
    }

    
    
});

// @route   post api/classnotice
// @decs    create a notice for a class
// @access  private

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        if(req.user.role === roles.student){
            error.msg = "student is unautharised";
            return res.status(400).json(errors);
        }
        else if (req.user.role === roles.department){
            const branch =                  req.body.branch;
            const year =                    req.body.year;
            const section =                 req.body.section;
            const semester =                req.body.semester;
            const classNoticeTitle =         req.body.classNoticeTitle;
            const description =             req.body.description;
            

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
                    errors.classRoom = "There is no class found"
                    return res.status(404).json(errors);
                }
                const classId = classRoom.id;
                console.log(classId);
                ClassNotice.
                findOne({
                    classId,
                    classNoticeTitle
                })
                .then(classnotice=>{
                    if(classnotice){
                        errors.classnotice = "class notice already exist";
                        return res.status(404).json(errors);
                    }
                    const newclassnotice = new ClassNotice({
                        classId,
                        classNoticeTitle,
                        description

                    })
                    newclassnotice.save()
                    .then(classnotice => res.json(classnotice))
                    .catch(err => console.log(err))
                }).catch(err => console.log(err));
    
            }).catch(err => console.log(err));
        }

});


// @route   delete api/classnotice
// @decs    delete notice of a class
// @access  private

router.delete('/:noticeId', passport.authenticate('jwt', {session: false}), (req, res) => {  
    const errors = {};
    if(req.user.role === roles.student){
        errors.msg = 'Student are not Authrized ';
        return res.json(errors);
    } else if (req.user.role === roles.department){
        const noticeId = req.params.noticeId;
        console.log("backend noticeId ", noticeId);
        ClassNotice.
            findOneAndDelete({
                _id: noticeId
            })
            .then(classnotice =>{
                if(!classnotice){
                    errors.classnotice = "this notice not found";
                    return res.status(404).json(errors);
                }
                const classId = classnotice.classId;
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
                })
                .catch(err => res.status(400).json(err));
            })
        .catch(err => res.status(400).json(err));
    }


    
});


module.exports = router;