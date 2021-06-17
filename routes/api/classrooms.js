const express = require('express'); 
const router = express.Router();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// keys
const roles = require('../../config/role');


// lodad moddles

const User = require('../../models/User');
const Department = require('../../models/Department');
const ClassRoom = require('../../models/ClassRoom');
const Subject = require('../../models/Subject');
const Notes = require('../../models/Notes');
const SubjectNotice = require('../../models/SubjectNotice');
const ClassNotice = require('../../models/ClassNotice');


// @route   GET api/profile/test
// @decs    Test profile route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " year is working"}));

// @route   GET api/calsroom
// @decs    Get a class
// @access  private

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
        
        const classroomfind = (year, branch, semester, section) =>{
            const errors = {};
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
                    console.log(subject)
                    return res.json(subject);
                }).catch(err => res.status(400).json(err));
            })
            .catch(err =>{ console.log("error: ",err),
                 res.status(400).json(err)
            });
        }
        


       if(req.user.role === roles.student){
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
            classroomfind(year,branch,semester,section);
            console.log(req.user.role);
        } else if( req.user.role === roles.department)
        {  console.log("roles.department=",roles.department)
            const branch = req.body.branch;
                
            const year = req.body.year;
  
            const section = req.body.section;

            const semester = req.body.semester;

            console.log(" ye hai ", branch," ", year," ", section," ", semester)

            classroomfind(year, branch, semester, section );
            console.log(req.user.role);
        }
               
        
});

// @route   GET api/calsroom
// @decs    Get a class
// @access  private

router.get('/department/:classId', passport.authenticate('jwt', {session: false}), (req, res) => {
        
    const classroomfind = (classId) =>{
        const errors = {};
        //user: req.user.branch, user: req.user.section
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
    }
    
    const errors = {};

   if(req.user.role === roles.student){
        errors.msg = 'Student are not Authrized ';
        return res.status(400).json(errors);
    } else if( req.user.role === roles.department)
    {  
        //console.log("roles.department=",roles.department)
        

        const classId = req.params.classId;

        classroomfind(classId );
        console.log(req.user.role);
    }
           
    
});

// @route   post api/calsroom
// @decs    create a class
// @access  private

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        //console.log( req.user.role, " starting ");
        if(req.user.role === roles.student){
            errors.msg = 'Student are not Authrized ';
            return res.status(400).json(errors);
        } else if (req.user.role === roles.department   ){
                const branch = req.body.branch;        
                const year = req.body.year;
                const section = req.body.section;
                const semester = req.body.semester;


                ClassRoom
                .findOne({
                    year,
                    branch,
                    semester,
                    section
                })           
                .then(classRoom =>{
                if(classRoom){
                    
                    errors.classroom = "class is already exist";
                    
                    return res.status(400).json(errors);
                } 
                console.log("befor new classroom")
                const newclass = new ClassRoom({
                    year,
                    branch,
                    semester,
                    section
                })
                newclass.save()
                .then(classRoom => res.json(classRoom))
                .catch(err => console.log(err));
                
                console.log("after new classroom");
                    
                
            }).catch(err => console.log(err));
        }

        
        
        

        //user: req.user.branch, user: req.user.section
        


});




// @route   delete api/classroom
// @decs    delete a class
// @access  private

router.delete('/:classId', passport.authenticate('jwt', {session: false}), (req, res) => {
        
   const classroomfindAndDelete = (classId) =>{
        const errors = {};
        //const classId = classId;
        // const classId = classId;
            // console.log(classId);
            Subject
            .find
            ({
                classId
            })
            .then(subject =>{
                if(!subject){
                    errors.subject = "Subject not found";
                    return res.status(400).json(errors);
                }
                else{

                    console.log("subject ====",subject);

                    const subjectArray   = subject;
                    const subjectLength = subjectArray.length;
                    // console.log(l);
                    for(var i= 0; i<subjectLength; i++){
                        console.log("id for subject notice ",i," =",subjectArray[i].id);
                        var subjectId =  subjectArray[i].id;
                        SubjectNotice
                        .deleteMany({
                            subjectId,
                        })
                        .then(SubjectNotice =>{
                            if(!SubjectNotice){
                                errors.notes ="there is no notes present in this subject";
                                console.log(errors);
                                //return res.status(400).json(errors);
                            }
                            console.log('notes===', notes);
                            console.log(`all notes related to this ${SubjectNotice.id} is deleted`);  

                        })
                        .catch(err => res.status(400).json(err));

                        console.log( `subjet relaterd to this id ${subjectId} is ended` );
                    }
                    ClassNotice
                    .deleteMany({
                        classId
                    })
                    .then(ClassNotice =>{
                        if(!ClassNotice){
                            errors.subject = "Subject not found";
                            return res.status(404).json(errors);
                        }
                        console.log('subject is deleted', subject, " end of subject delete" )
                        Subject
                        .find
                        ({
                            classId
                        })
                        .then(subject =>{
                            if(!subject){
                                errors.subject = "Subject not found";
                                return res.status(400).json(errors);
                            }
                            else{

                                console.log("subject ====",subject);

                                const subjectArray   = subject;
                                const subjectLength = subjectArray.length;
                                // console.log(l);
                                for(var i= 0; i<subjectLength; i++){
                                    console.log("id  ",i," =",subjectArray[i].id);
                                    var subjectId =  subjectArray[i].id;
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
                                }
                                Subject
                                .deleteMany({
                                    classId
                                })
                                .then(subject =>{
                                    if(!subject){
                                        errors.subject = "Subject not found";
                                        return res.status(404).json(errors);
                                    }
                                    console.log('subject is deleted', subject, " end of subject delete" )
                                    console.log("classId",classId)
                                    ClassRoom
                                    .findOneAndDelete({
                                        _id: classId,
                                    }).then(classRoom =>{
                                        if(!classRoom){
                                            errors.classRoomis = "There is no class found"
                                            return res.status(400).json(errors);
                                        }
                                        ClassRoom
                                        .find({
                                        })           
                                        .then(classRooms =>{
                                        if(!classRooms){
                                            
                                            errors.classroom = "classes is not exist";
                                            
                                            return res.status(400).json(errors);
                                        } 
                                        
                                        return res.status(200).json(classRooms);
                                            
                                        
                                    }).catch(err => console.log(err));
                                    })
                                    .catch(err => res.status(400).json(err));
                                })
                                .catch(err => res.status(400).json(err));
                            }
                            
                                
                        })
                        .catch(err => res.status(400).json(err));
                    })
                    .catch(err => res.status(400).json(err));
                }
                
                    
            })
            .catch(err => res.status(400).json(err));
    }


    if(req.user.role === roles.student ){
        errors.msg = " user not allow to delete";
        return res.status(400).json(errors);
    }
    else if( req.user.role === roles.department)
    {  
        // console.log("roles.department=",roles.department)
        const classId = req.params.classId;
        console.log("outer class id ",classId);
        classroomfindAndDelete(classId);
        // console.log(req.user.role);
    }
           
    
});


// @route   get api/calsroom/all
// @decs    get all class
// @access  private
router.get('/all', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    //console.log( req.user.role, " starting ");
    if(req.user.role === roles.student){
        errors.msg = 'Student are not Authrized ';
        return res.json(errors);
    } else if (req.user.role === roles.department   ){
            


            ClassRoom
            .find({
            })           
            .then(classRooms =>{
            if(!classRooms){
                
                errors.classroom = "classes is not exist";
                
                return res.status(400).json(errors);
            } 
            
            return res.status(200).json(classRooms);
                
            
        }).catch(err => console.log(err));
    }

    
    
    

    //user: req.user.branch, user: req.user.section
    


});



module.exports = router;