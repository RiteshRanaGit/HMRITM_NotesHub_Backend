const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Schema
const UserSchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    enroll: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    yearOfAdmission:{
        type: Number,
        required: true
    },
    branch: {
        type: String,
        required: true,
    },
    section:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    }
     
});

module.exports = User = mongoose.model('users', UserSchema);

