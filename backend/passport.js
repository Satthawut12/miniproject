const db = require('./database.js');
let users = db.users

const passport = require('passport')
const bcrypt = require('bcrypt')

const passportJWT = require("passport-jwt"),
    ExtractJWT = passportJWT.ExtractJwt,
    JWTStrategy = passportJWT.Strategy,
    LocalStrategy = require('passport-local').Strategy
 
passport.use(
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, async (username, password, cb) => {
        const index = db.checkExistingUser(username)
        console.log("index: ",index);
        if (index !== db.NOT_FOUND && await db.isValidUser(username, password)) {
            const { id, username, email } = users.users[index]
            return cb(null,
                { id, username, email },
                { message: 'Logged In Successfully' })
        }
        else
            return cb(null, false, { message: 'Incorrect user or password.' })


    }));

passport.use(
    new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: db.SECRET
    },
        (jwtPayload, cb) => {
            try {
                const index = db.checkExistingUser(jwtPayload.username)
                if (index !== db.NOT_FOUND) {
                    const { id, username, email } = users.users[index]
                    return cb(null, { id, username, email }); 
                } else {
                    return cb(null, false);
                }
            } catch (error) {
                return cb(error, false);
            }
        }
    ));
