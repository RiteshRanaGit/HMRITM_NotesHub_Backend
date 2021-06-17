const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cereat schema 
const subjectSchema = new Schema ({
    ClassRoom: {
        type: Schema.Types.ObjectId,
        refer: "classrooms"
    },
    classId : {
        type: String,
        required: true
    },
    subjectTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
    
     
});



module.exports = Subject = mongoose.model('subjects', subjectSchema);