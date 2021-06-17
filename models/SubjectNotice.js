const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cereat schema 
const subjectnoticeSchema = new Schema ({
    Subject: {
        type: Schema.Types.ObjectId,
        refer: "subject"
    },
    subjectId : {
        type: String,
        required: true
    },
    subjectNoticeTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }     
});



module.exports = SubjectNotice = mongoose.model('subjectnotice', subjectnoticeSchema);