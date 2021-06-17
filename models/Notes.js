const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cereat schema 
const notesSchema = new Schema ({
    Subject: {
        type: Schema.Types.ObjectId,
        refer: "subjects"
    },
    subjectId : {
        type: String,
        required: true
    },
    notesTitle: {
        type: String,
        required: true
    },  
    description: {
        type: String,
        required: true
    },
    file: {
        file_type: {
          type: String,
          default: "",
          //figure out  its requirement
        },
        file_url: {
          type: String,
          required: true,
        },
        // s3_key: {
        //   type: String,
        //   required: true,
        // },
    },
    
     
});

module.exports = Notes = mongoose.model('Notes', notesSchema);