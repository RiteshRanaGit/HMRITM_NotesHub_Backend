const express = require('express');
const bcrypt = require('bcryptjs'); 
const router = express.Router();
const keys = require('../../config/keys');
const roles = require('../../config/role');

const jwt = require('jsonwebtoken');
const passport = require('passport');

// lodad moddles
const Department = require('../../models/Department');
// const ClassRoom = require('../../models/ClassRoom');
// const Subject = require('../../models/Subject');
// const ClassNotice = require('../../models/ClassNotice');

//Load Input validation
const validateRegisterInputDepartment = require('../../validation/department/departmentregister');
const validateLoginInput = require('../../validation/login');
const { default: validator } = require('validator');  // ye aplne aap aay hai 
const { department } = require('../../config/role');


//Load user model


// @route   GET api/department/test
// @decs    Test user route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: " department is working"}));

// @route   post api/department/register
// @decs    Register  department 
// @access  private

router.post('/register', (req, res) => {
    
    // check validation
    const {errors, isValid } = validateRegisterInputDepartment(req.body);
    console.log(isValid, "isvalid");
    console.log(errors, "errors");
    
    if(isValid === false){
        
        return res.status(400).json(errors);
    }
    

    Department.findOne({email: req.body.email})
    .then(department => {
        if(department){
            errors.email = "email already exist";
            return res.status(400).json(errors);
        } else {
            console.log("befor new user")
            const newDepartment = new Department({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                department: req.body.department,
                role: roles.department
            });
            console.log("after new user")
            bcrypt.genSalt(10,(err, salt) =>{
                bcrypt.hash(newDepartment.password, salt, (err, hash)=>{
                    if(err) throw err;
                    newDepartment.password = hash;
                    newDepartment.save()
                    .then(department => res.json(department))
                    .catch(err => console.log(err));
                })
            })
        }
    })
})

// @route   post api/department/login
// @decs    department login / Return jwt token 
// @access  Public

router.post('/login', (req, res) => {

    // check validation
    const {errors, isValid } = validateLoginInput(req.body);
    
    if(isValid === false){
        
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    const role = roles.department;
    
    console.log(email);
    console.log(password);

    //find user by email
    Department.findOne({email})
    .then(department => {
        // console.log(user);
        if(!department){
            errors.email = "department Id not Found!"
            return res.status(400).json(errors);
        }

        // check password
        bcrypt.compare(password, department.password)
        .then( ismatch => {
            if(ismatch){
                //user match
                const payload = {
                    id: department.id,
                    name: department.name,
                    email: department.email,
                    department: department.department,
                    role : department.role
                } // create jwt payload
                // console.log(payload);
                // sign token 
                console.log("payload=", payload);
                jwt.sign(
                    payload,
                    keys.secretOrKey, 
                    { expiresIn: 3600},
                    (err, token) =>{
                        res.json({
                            sucess: true,
                            token: 'bearer ' + token
                        });
                    });

            } else {
                errors.password = "Password is incorrect"
                return res.status(400).json(errors);
            }
            
        })
        
    })
});

// @route   post api/department
// @decs    Return current user 
// @access  Private

router.get('/current',passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    
    res.json({  
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
        role: req.user.role
        
        
    });
});





module.exports = router;