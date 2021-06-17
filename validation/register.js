const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput (data) {
    let errors = {};

    data.name = !isEmpty(data.name)? data.name : '';
    data.email = !isEmpty(data.email)? data.email : '';
    data.enroll = !isEmpty(data.enroll)? data.enroll : '';
    data.password = !isEmpty(data.password)? data.password : '';
    data.password2 = !isEmpty(data.password2)? data.password2 : '';
    data.yearOfAdmission = !isEmpty(data.yearOfAdmission)? data.yearOfAdmission : '';
    data.branch = !isEmpty(data.branch)? data.branch : '';
    data.section = !isEmpty(data.section)? data.section : '';

    if(!Validator.isLength(data.name, {min: 2, max: 30})){
        errors.name ="name must be  between 2 and 30 characters"; 
    }

    if(Validator.isEmpty(data.name)){
        errors.name = "Name feild is required";
    }
    if(Validator.isEmpty(data.enroll)){
        errors.enroll = "Enrollment number is required";
    }
    if(Validator.isEmpty(data.email)){
        errors.email = "Email feild is required";
    } else if(!Validator.isEmail(data.email)){
        errors.email = "eamil is invalid";
    }
    if(Validator.isEmpty(data.password)){
        errors.password = "password feild is required";
    }
    if(!Validator.isLength(data.password, {min: 6, max: 30 })){
        errors.password = "password must atlest 6 characters";
    }
    if(Validator.isEmpty(data.password2)){
        errors.password2 = "confirm password feild is required";
    } else if(!Validator.equals(data.password, data.password2)){
        errors.password2 = "passwords must match";
    }

    if(Validator.isEmpty(data.branch)){
        errors.branch = "Branch feild is required";
    }
    if(Validator.isEmpty(data.yearOfAdmission)){
        errors.yearOfAdmission = "Year of Admission feild is required";
    }
    if(Validator.isEmpty(data.section)){
        errors.section = "section feild is required";
    }
    const isValid =  isEmpty(errors);
    return {
        
        errors,
        isValid
    };
}