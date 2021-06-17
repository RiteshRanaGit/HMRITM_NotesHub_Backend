const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('users');
const Department = mongoose.model('departments');

const keys = require('../config/keys');
const roles = require('./role');

const opts ={};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (Jwt_payload, done) => {
        if(Jwt_payload.role === roles.student){
            User.findById(Jwt_payload.id)
            .then(user => {
                if(user){
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => console.log(err));
        } 
        else if(Jwt_payload.role === roles.department){
            Department.findById(Jwt_payload.id)
            .then(department => {
                if(department){
                    return done(null, department);
                }
                return done(null, false);
            })
            .catch(err => console.log(err));
        }
    }))
}

