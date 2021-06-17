const express = require('express');
// const bcrypt = require('bcryptjs'); 
// const router = express.Router();
const keys = require('../../config/keys');
// const roles = require('../../config/role');

// const jwt = require('jsonwebtoken');
// const passport = require('passport');

// lodad moddles
const User = require('../../models/User');
// d

//Load Input validation
// const validateRegisterInput = require('../../validation/register');
// const validateLoginInput = require('../../validation//login');
// const { default: validator } = require('validator');


const deletePassOut = () => {
    var year = Date.year() - 4;

    User.findAllDelete({yearOfAdmission: year})
    .then(user => {
        // console.log(user);
        if(!user){
            errors.email = "No user found"
            return res.status(400).json(errors);
        }
        return res.status(200).json(user);
       
        
        
    })
}





var month = Date.month;
if( month = 8 ){
        deletePassOut();
}
