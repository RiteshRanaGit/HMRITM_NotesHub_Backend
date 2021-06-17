const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cereat schema 
const classnoticeSchema = new Schema ({
    ClassRoom: {
        type: Schema.Types.ObjectId,
        refer: "classrooms"
    },
    classId : {
        type: String,
        required: true
    },
    classNoticeTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }     
});



module.exports = ClassNotice = mongoose.model('classnotice', classnoticeSchema);