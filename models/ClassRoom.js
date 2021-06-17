const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cereat schema 
const classRoomSchema = new Schema ({
    // User: {
    //     type: Schema.Types.ObjectId,
    //     refer: "users"
    // },
    year: {
        type: Number,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    }
    
     
});



module.exports = ClassRoom = mongoose.model('classrooms', classRoomSchema);