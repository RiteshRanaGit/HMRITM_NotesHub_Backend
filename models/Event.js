const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//cereat schema 
const eventSchema = new Schema ({
    // Subject: {
    //     type: Schema.Types.ObjectId,
    //     refer: "subjects"
    // },
    // subjectId : {
    //     type: String,
    //     required: true
    // },
    eventHeading: {
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
    // endDate:{
    //     date: new Date 
    // }
    
     
});

module.exports = Event = mongoose.model('Event', eventSchema);