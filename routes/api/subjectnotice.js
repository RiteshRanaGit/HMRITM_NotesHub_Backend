const express = require('express'); 
const router = express.Router();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// lodad moddles


const ClassRoom = require('../../models/ClassRoom');
const Subject = require('../../models/Subject');

const SubjectNotice = require('../../models/SubjectNotice');

//role 
const roles = require('../../config/role');


// @route   GET api/profile/test
// @decs    Test profile route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " Notes is working"}));

// @route   GET api/classnotice
// @decs    Get notice of a class
// @access  private

router.get('/:subjectTitle', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        

        const getsubjectnots = ( year, branch, section, semester, subjectTitle) =>{
            ClassRoom
            .findOne({
                year,
                branch,
                semester,
                section
            }) //user: req.user.branch, user: req.user.section
            .then( classRoom =>{
                if(!classRoom){
                    errors.classroom = "There is no class found"
                    return res.status(404).json(errors);
                }
                const classId = classRoom.id;
                console.log(classId);
                Subject.
                findOne({
                    classId,
                    subjectTitle
                })
                .then(subject =>{
                    if(!subject){
                        
                        errors.subject = "subject not found";
                        console.log(errors);
                        return res.status(400).json(errors);
                    }
                    const subjectId = subject.id;
                    SubjectNotice.
                    find({
                        subjectId
                    })
                    .then(subjectNotice =>{
                        if(!subjectNotice){
                            errors.msg =" no notice are avalable";
                            return res.status(400).json(errors);
                        }
                        return res.status(200).json(subjectNotice);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(400).json(err);
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json(err);
                });
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
        }
        


    if(req.user.role === roles.student){
        const userYear = req.user.yearOfAdmission;
        const branch = req.user.branch;
        const section = req.user.section;
        const subjectTitle = req.params.subjectTitle;
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
        

        console.log(year);
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

        getsubjectnots  ( year, branch, section, semester, subjectTitle);
    }
    else if (req.user.role === roles.department){
        const branch = req.body.branch;
        const year = req.body.year;
        const section = req.body.section;
        const semester = req.body.semester;
        const subjectTitle = req.body.subjectTitle;
        getsubjectnots  ( year, branch, section, semester, subjectTitle);
    }
});


// @route   GET api/subjectNotice/dep[artmenst]
// @decs    Get notice of a class
// @access  private

router.get('/department/:subjectId', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    

    const getsubjectnots = (subjectId) =>{
        SubjectNotice.
                find({
                    subjectId
                })
                .then(subjectNotice =>{
                    if(!subjectNotice){
                        errors.msg =" no notice are avalable";
                        return res.status(400).json(errors);
                    }
                    return res.status(200).json(subjectNotice);
                })
                .catch(err => res.status(400).json(err));
    }

    if(req.user.role === roles.student){
        errors.msg = 'Student are not Authrized ';
        return res.status(400).json(errors);
    }
    else if (req.user.role === roles.department){
        
        const subjectId = req.params.subjectId;
        getsubjectnots  ( subjectId);
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
        const branch =              req.body.branch;
        const year =                req.body.year;
        const section =             req.body.section;
        const semester =            req.body.semester;
        const subjectTitle =        req.body.subjectTitle;
        const subjectNoticeTitle =  req.body.subjectNoticeTitle;
        const description =         req.body.description;
        

       
        ClassRoom
        .findOne({
            year,
            branch,
            semester,
            section
        })           
        .then(classRoom =>{
            if(!classRoom){
                errors.classroom = "There is no class found"
                return res.status(400).json(errors);
            }
            const classId = classRoom.id;
            console.log(classId);
            Subject.
            findOne({
                classId,
                subjectTitle
            })
            .then(subject=>{
                if(!subject){
                    errors.subject = "no subject found";
                    return res.status(404).json(errors);
                }
                const subjectId = subject.id;
                SubjectNotice.
                findOne({
                    subjectId,
                    subjectNoticeTitle
                })
                .then(subjectNotice =>{
                    if(subjectNotice){
                        console.log("bhai yaha hun")
                        errors.subjectnotice =" subject  notice already exist";
                        return res.status(400).json(errors);
                    }
                    console.log("bahar hun");
                    const newsubjectnotice = new SubjectNotice({
                        subjectId,
                        subjectNoticeTitle,
                        description

                    })
                    newsubjectnotice.save()
                    .then(subjectNotice => res.json(subjectNotice))
                    .catch(err => console.log(err))
                })
                .catch(err => res.status(400).json(err));
                
            })
            .catch(err => console.log(err));

        })
        .catch(err => console.log(err));
    }
        


});

// @route   delete api/classnotice
// @decs    delete notice of a class
// @access  private

router.delete('/:noticeId', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    

    const deletesubjectnots = (noticeId) =>{
        SubjectNotice.
                findOneAndDelete({
                    _id: noticeId
                })
                .then(subjectNotice =>{
                    if(!subjectNotice){
                        errors.msg =" no notice are avalable";
                        return res.status(404).json(errors);
                    }
                    const subjectId = subjectNotice.subjectId;
                    SubjectNotice.
                    find({
                        subjectId
                    })
                    .then(subjectNotice =>{
                        if(!subjectNotice){
                            errors.msg =" no notice are avalable";
                            return res.status(400).json(errors);
                        }
                        return res.status(200).json(subjectNotice);
                    })
                    .catch(err => res.status(400).json(err))
                    
        })
        .catch(err => res.status(400).json(err));
    }
        


    if(req.user.role === roles.student){
        error.msg = "student is unautharised";
        return res.status(400).json(errors);
    }
    else if (req.user.role === roles.department){
        const noticeId = req.params.noticeId;
        deletesubjectnots  ( noticeId );
    }
});


module.exports = router;