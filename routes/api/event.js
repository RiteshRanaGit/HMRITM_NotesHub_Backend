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


const Event = require('../../models/Event');
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

// @route   GET api/notes/test
// @decs    Test notes route
// @access  Public

router.get('/test', (req, res) => res.json({
    msg: " event  is working"
}));

// @route   GET api/notes
// @decs    Get notes of current subjects
// @access  private
//passport.authenticate('jwt', {session: false}),
router.get('/', (req, res) => {
    const errors = {};
    Event
        .find({})
        .then(event => {
            if (!event) {

                errors.event = "Event is not exist";

                return res.status(400).json(errors);
            }

            return res.status(200).json(event);


        }).catch(err => console.log(err));
});
// @route   post api/notes
// @decs    create notes of current subject
// @access  private

router.post('/', [
    passport.authenticate('jwt', {
        session: false
    }),
    uploader.single('file')
], (req, res, next) => {
    const errors = {};
    if (req.user.role === roles.student) {
        errors.msg = 'Student are not Authrized ';
        return res.status(400).json(errors);
    } else if (req.user.role === roles.department) {
        const eventHeading = req.body.eventHeading;
        const description = req.body.description;
        //const section = req.body.section;
        //const semester = req.body.semester;
        Event.findOne({
                eventHeading,
            })
            .then(event => {
                if (event) {
                    errors.event = "event is exist";
                    return res.status(400).json(errors);
                }
                try {
                    if (!req.file) {
                        errors.event = "Error, no file found";
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
                        const newevent = new Event({
                            eventHeading,
                            description,
                            file: {
                                file_type,
                                file_url
                            }
                        })
                        newevent.save()
                            .then(event => res.json(event))
                            .catch(err => console.log(err));
                    });
                    // When there is no more data to be consumed from the stream
                    blobWriter.end(req.file.buffer);
                } catch (error) {
                    res.status(400).send(`Error, could not upload file: ${error}`);
                    return;
                }
            })
            .catch(err => console.log(err))
    }
});


// @route   delete api/notes/delete
// @decs    delete a notes object 
// @access  private
router.delete('/:eventId',
    [
        passport.authenticate('jwt', {
            session: false
        }),
        uploader.single('file')
    ], (req, res) => {
        const errors = {};


        const deleteEvent = (eventsId) => {
            Event.findOneAndDelete({
                    _id: eventsId
                })
                .then(event => {
                    if (!event) {
                        errors.event = "there is no event present";
                        return res.status(404).json(errors);
                    }
                    return response.status(200).json(event);
                })
                .catch(err => res.status(400).json(err));
        }

        if (req.user.role === roles.student) {
            errors.msg = " user not allow to delete";
            return res.status(400).json(errors);
        } else if (req.user.role === roles.department) {
            const eventId = req.params.eventId;
            console.log(" backend delete params", eventId);
            deleteEvent(eventId);
        }

    });

module.exports = router;