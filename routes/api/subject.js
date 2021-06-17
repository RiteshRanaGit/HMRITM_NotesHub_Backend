const express = require('express'); 
const router = express.Router();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// lodad moddles

// const User = require('../../models/User');
const ClassRoom = require('../../models/ClassRoom');
const Subject = require('../../models/Subject');

// role
const roles = require('../../config/role');
const Notes = require('../../models/Notes');


// @route   GET api/profile/test
// @decs    Test profile route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " subjesct is working"}));

// @route   GET api/subject
// @decs    Get subject of current class
// @access  private

router.get('/:subjectTitle', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        const getsubjects = (year, branch, semester, section, subjectTitle) =>{
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
                    //console.log(classId);
                    Subject.
                    findOne({
                        classId,
                        subjectTitle
                    })
                    .then(subject =>{
                        if(!subject){
                            errors.subject = "Subject not found";
                            return res.status(404).json(errors);
                        }
                        const subjectId = subject.id;
                        //console.log(subjectID);
                        Notes.find({
                            subjectId
                        })
                        .then(notes =>{
                            if(!notes){
                                errors.notes ="notes not found";
                                console.log("errrors are under ", errors);
                                return res.status(400).json(errors);
                                
                            }
                            return res.status(200).json(notes);
                        })
                    })
            })
            .catch(err => res.status(400).json(err));

        }


        if(req.user.role === roles.student){
            const userYear = req.user.yearOfAdmission;
            const branch = req.user.branch;
            const section = req.user.section;
            const subjectTitle = req.params.subjectTitle;
            console.log(" subject title ", subjectTitle);
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
            getsubjects(year, branch, semester, section, subjectTitle);

        }
        else if (req.user.role === roles.department){
            console.log("in esle if", req.user.role);
            const branch = req.body.branch;
            const year = req.body.year;
            const section = req.body.section;
            const semester = req.body.semester;
            const subjectTitle = req.body.title;

            getsubjects(year, branch, semester, section, subjectTitle);
            
        }

        
        
});


// @route   GET api/subject
// @decs    Get subject of current class
// @access  private

router.get('/department/:subjectId', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    const getDepartmentsubjects = (subjectId) =>{
        console.log(" subject id",subjectId);
        Notes.find({
            subjectId
        })
        .then(notes =>{
            if(!notes){
                errors.notes ="notes not found";
                console.log("errrors are under ", errors);
                return res.status(400).json(errors);
                
            }
            return res.status(200).json(notes);
        }).catch(err => {
            //console.log(err);
            res.status(400).json(err);
        });

    }


    if(req.user.role === roles.student){
        errors.msg = 'Student are not Authrized ';
        return res.status(400).json(errors);
        //getsubjects(year, branch, semester, section, subjectTitle);

    }
    else if (req.user.role === roles.department){
        //console.log("in esle if", req.user.role);
       
        const subjectId = req.params.subjectId;

        getDepartmentsubjects(subjectId);
        
    }

    
    
});


// @route   post api/subject
// @decs    create subject
// @access  private

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};

    if(req.user.role === roles.student){
        errors.msg = 'Student are not Authrized ';
        return res.json(errors);
    }
    else if (req.user.role === roles.department){
        const branch =          req.body.branch;
        const year =            req.body.year;
        const section =         req.body.section;
        const semester =        req.body.semester;
        const subjectTitle =    req.body.subjectTitle;
        const description =     req.body.description;
        

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
        Subject.
        findOne({
            classId,
            subjectTitle
        })
        .then(subject =>{
            if(subject){
                errors.subject = "Subject already exist";
                return res.status(404).json(errors);
            }
            const newsubject = new Subject({
                classId,
                subjectTitle,
                description

            })
            newsubject.save()
            .then(subject => res.json(subject))
            .catch(err => console.log(err))
            })
            .catch(err => console.log(err));

        }).catch(err => console.log(err));


    }



        


});



// @route   delete api/subject
// @decs    delete subject 
// @access  private

router.delete('/:subjectId', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    const deletesubjects = (subjectId) =>{
        Subject
            .findOne
            ({
                _id: subjectId
            })
            .then(subject =>{
                if(!subject){
                    errors.subject = "Subject not found";
                    return res.status(400).json(errors);
                }
                

                console.log("subject ====",subject);

                //const subjectId   = subject.id;
   
                Notes
                .deleteMany({
                    subjectId,
                })
                .then(notes =>{
                    if(!notes){
                        errors.notes ="there is no notes present in this subject";
                        console.log(errors);
                        //return res.status(400).json(errors);
                    }
                    console.log('notes===', notes);
                    console.log(`all notes related to this ${notes.id} is deleted`);  

                })
                .catch(err => res.status(400).json(err));

                console.log( `subjet relaterd to this id ${subjectId} is ended` );

                SubjectNotice.
                deleteMany({
                    subjectId
                })
                .then(subjectNotice =>{
                    if(!subjectNotice){
                        errors.msg =" no notice are avalable";
                        //return res.status(400).json(errors);
                    }
                    //return res.status(200).json(subjectNotice);
                })
                .catch(err => res.status(400).json(err));
                
                Subject
                .findOneAndDelete({
                    _id: subjectId
                })
                .then(subject =>{
                    if(!subject){
                        errors.subject = "Subject not found";
                        return res.status(404).json(errors);
                    }
                    console.log('subject is deleted', subject, " end of subject delete" );
                    const classId = classId.subject;
                    Subject.
                    find({
                        classId
                    })
                    .then(subject =>{
                        if(!subject){
                            errors.subject = "Subject not found";
                            return res.status(404).json(errors);
                        }
                        console.log(subject)
                        return res.json(subject);
                    }).catch(err => res.status(400).json(err));  
                })
                .catch(err => res.status(400).json(err));
            })
            .catch(err => res.status(400).json(err));

    }


    if(req.user.role === roles.student ){
        errors.msg = " user not allow to delete";
        return res.status(400).json(errors);
    }
    else if (req.user.role === roles.department){
       
        const subjectId = req.params.subjectId;

        deletesubjects(subjectId);
        
    }

    
    
});

module.exports = router;