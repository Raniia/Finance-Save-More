const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
const Countries = require('../models/Countries');


router.get('/login', (req, res) => {
    res.render('login', {
        user: req.user
    });
});
router.get('/register', (req, res) => {
    Countries.find({}).then(function (result) {
        res.render('register', {
            user: req.user,
            Countries: result
        });
    });
  });
});
router.post('/register', (req, res) => {
    const { name, email, password, password2, country } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2 || !country) {
        errors.push({ msg: 'Please fill in all the fields' })
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' })
    }
    if (errors.length > 0) {
        Countries.find({}).then(function (result) {
            res.render('register', {
                errors, name, email, password, password2, user: req.user, Countries: result
            });
        });
    }
    else {
        User.findOne({ email: email }).then((user) => {
            if (user) {
                errors.push({ msg: 'This email is already in use,' })
                Countries.find({}).then(function (result) {
                    res.render('register', { errors, name, email, password, password2, user: req.user,Countries: result });

                });
            } else {
                const newUser = new User({ name, email, password, country });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save().then(user => {
                            req.flash("success_msg", 'Registered successfully. Login now.');
                            res.redirect('/users/login')
                        }).catch(err => console.log(err));
                    })
                })
            }
        });
      }
    });
  }
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/save-more',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});
module.exports = router;
