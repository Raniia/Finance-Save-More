const express = require('express');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const router = express.Router();
router.get('/', (req, res) => {
  res.render('welcome', {
    user: req.user
  });
})
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: req.user
  })
})
router.get('/why-us', (req, res) => {
  res.render('why-us', {
    user: req.user
  })
})
router.get('/contact-us', (req, res) => {
  res.render('contact-us', {
    user: req.user
  })
})
router.get('/buy-or-not', ensureAuthenticated, (req, res) => {
  res.render('buy-or-not', {
    user: req.user
  })
})
module.exports = router;