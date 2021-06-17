const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const passport = require('passport');


require('dotenv').config();
const cors = require('cors');
const multer = require('multer');
const {
    Storage
} = require('@google-cloud/storage');

var admin = require("firebase-admin");






// role
const roles = require('../../config/role');

//
const dbconfig = require('../../config/dbconfig');

// lodad moddles

// const User = require('../../models/User');
const ClassRoom = require('../../models/ClassRoom');
const Subject = require('../../models/Subject');
const Notes = require('../../models/Notes');
const {
    response
} = require('express');



// Create new storage instance with Firebase project credentials
const storage = new Storage({
    // projectId: process.env.GCLOUD_PROJECT_ID,
    // keyFilename: process.env.GCLOUD_APPLICATION_CREDENTIALS,
    projectId: dbconfig.GCLOUD_PROJECT_ID,
    keyFilename: dbconfig.GCLOUD_APPLICATION_CREDENTIALS,
});





// Create a bucket associated to Firebase storage bucket
const bucket = storage.bucket(dbconfig.GCLOUD_STORAGE_BUCKET_URL);

// Initiating a memory storage engine to store files as Buffer objects
const uploader = multer({
    storage: multer.memoryStorage(),
});


// admin.storage().bucket(bucket).refFromURL(/* ... */).delete()
// .then(function() {
//     console.log("deleted successfully!");
// })
// .catch(function() {
//     console.log("unable to delete");
// });
// @route   GET api/notes/test
// @decs    Test notes route
// @access  Public

router.get('/test', (req, res) => res.json({
    msg: " notes is working"
}));

// @route   GET api/notes
// @decs    Get notes of current subjects
// @access  private

router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const errors = {};


    const getNotes = (year, branch, semester, section, subjectTitle) => {
        ClassRoom
            .findOne({
                year,
                branch,
                semester,
                section
            }) //user: req.user.branch, user: req.user.section
            .then(classRoom => {
                if (!classRoom) {
                    errors.classRoomis = "There is no class found"
                    return res.status(404).json(errors);
                }
                const classId = classRoom.id;
                console.log(classId);
                Subject.
                findOne({
                        classId,
                        subjectTitle
                    })
                    .then(subject => {
                        if (!subject) {
                            errors.subject = "Subject not found";
                            return res.status(404).json(errors);
                        }
                        const subjectId = subject.id;
                        Notes.find({
                                subjectId,
                            })
                            .then(notes => {
                                if (!notes) {
                                    errors.notes = "there is no notes present in this subject";
                                    return res.status(404).json(errors);
                                }
                                return res.json(notes);

                            })
                            .catch(err => res.status(400).json(err));
                    })
                    .catch(err => res.status(400).json(err));
            })
            .catch(err => res.status(400).json(err));
    }

    if (req.user.role === roles.student) {
        const userYear = req.user.yearOfAdmission;
        const branch = req.user.branch;
        const section = req.user.section;
        const subjectTitle = req.body.subjectTitle;
        console.log("subject title", subjectTitle);
        const currentmonth = new Date().getMonth();
        const currentyear = new Date().getFullYear();

        // calculate current year ex first second third and fourth
        const yearcal = (currentyear, userYear, currentmonth) => {
            if (currentmonth >= 8) {
                return currentyear - userYear + 1;
            } else {
                return currentyear - userYear;
            }
        }
        const year = yearcal(currentyear, userYear, currentmonth);


        console.log(year);
        // calculate current semester 
        const semestercalulation = (currentmonth, year) => {

            if (currentmonth >= 8) {
                return year * 2 - 1;
            } else {
                return year * 2;
            }

        }
        const semester = semestercalulation(currentmonth, year);

        console.log(semester);
        console.log(branch);

        getNotes(year, branch, semester, section, subjectTitle);
    } else if (req.user.role === roles.department) {
        const branch = req.body.branch;
        const year = req.body.year;
        const section = req.body.section;
        const semester = req.body.semester;
        const subjectTitle = req.body.subjectTitle;
        getNotes(year, branch, semester, section, subjectTitle);
    }

});
// @route   post api/notes
// @decs    create notes of current subject
// @access  private

router.post(
    '/',
    [
        passport.authenticate('jwt', {
            session: false
        }),
        uploader.single('file')
    ],
    (req, res, next) => {
        const errors = {};
        if (req.user.role === roles.student) {
            errors.msg = "students are not authried";
            return res.status(404).json(errors);
        } else if (req.user.role === roles.department) {
            const branch = req.body.branch;
            const year = req.body.year;
            const section = req.body.section;
            const semester = req.body.semester;
            const subjectTitle = req.body.subjectTitle;
            const notesTitle = req.body.notesTitle;
            const description = req.body.description;

            ClassRoom
                .findOne({

                    year,
                    branch,
                    semester,
                    section
                })
                .then(classRoom => {
                    if (!classRoom) {
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
                        .then(subject => {
                            if (!subject) {
                                errors.subject = "Subject not exist";
                                return res.status(404).json(errors);
                            }

                            const subjectId = subject.id;
                            console.log(subjectId);
                            Notes.findOne({
                                    subjectId,
                                    notesTitle
                                })
                                .then(notes => {
                                    if (notes) {
                                        errors.notes = "notes is exist";
                                        return res.status(400).json(errors);
                                    }

                                    try {
                                        if (!req.file) {
                                            errors.notes = "Error, no file found";
                                            console.log(errors);
                                            return res.status(400).json(errors);
                                        }

                                        // Create new blob in the bucket referencing the file
                                        const blob = bucket.file(req.file.originalname);
                                        console.log('file orignal name--', req.file.originalname);

                                        // Create writable stream and specifying file mimetype
                                        const blobWriter = blob.createWriteStream({
                                            metadata: {
                                                contentType: req.file.mimetype,
                                            },
                                        });
                                        //console.log("ye blowWriter hai ", blobWriter, "khatam hai yaha");

                                        blobWriter.on('error', (err) => next(err));

                                        blobWriter.on('finish', () => {
                                            // Assembling public URL for accessing the file via HTTP
                                            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
                                bucket.name
                                }/o/${encodeURI(blob.name)}?alt=media`;

                                            console.log('file url ---', publicUrl)

                                            const file_url = publicUrl;
                                            console.log('file _type--', file_url);
                                            const file_type = req.file.mimetype
                                            const newnotes = new Notes({
                                                subjectId,
                                                notesTitle,
                                                description,
                                                file: {
                                                    file_type,
                                                    file_url
                                                }
                                            })
                                            newnotes.save()
                                                .then(notes => res.json(notes))
                                                .catch(err => console.log(err))



                                            ;
                                        });

                                        // When there is no more data to be consumed from the stream
                                        blobWriter.end(req.file.buffer);
                                    } catch (error) {
                                        res.status(400).send(`Error, could not upload file: ${error}`);
                                        return;
                                    }





                                })
                                .catch(err => console.log(err))

                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }







    });


// @route   delete api/notes/delete
// @decs    delete a notes object 
// @access  private
router.delete(
    '/:notesId',
    [
        passport.authenticate('jwt', {
            session: false
        }),
        uploader.single('file')
    ], (req, res) => {
        const errors = {};


        const deleteNotes = (notesId) => {
            Notes.findOneAndDelete({
                    _id: notesId
                })
                .then(notes => {
                    if (!notes) {
                        errors.notes = "there is no notes present in this subject";
                        return res.status(404).json(errors);
                    }
                    //console.log({notes});
                    const subjectId = notes.subjectId;
                    console.log("subject id ", subjectId);
                    Notes.find({
                            subjectId,
                        })
                        .then(notes => {
                            if (!notes) {
                                errors.notes = "there is no notes present in this subject";
                                return res.status(404).json(errors);
                            }
                            return response.status(200).json(notes);

                        })
                        .catch(err => res.status(400).json(err));




                })
                .catch(err => res.status(400).json(err));
        }

        if (req.user.role === roles.student) {
            errors.msg = " user not allow to delete";
            return res.status(400).json(errors);
        } else if (req.user.role === roles.department) {
            const notesId = req.params.notesId;
            console.log(" backend delete params", notesId);
            deleteNotes(notesId);
        }

    });


module.exports = router;