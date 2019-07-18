const express = require('express');
const unirest = require('unirest');
const Currency = require('../models/Currency');
const SavingDetails = require('../models/SavingDetails');

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
router.get('/categories/clothing', ensureAuthenticated, (req, res) => {

  SavingDetails.find({ user: req.user }).then((response) => {
    return response;
}).then((data)=>{
  Currency.find({ code: data[0].currencies }).then((curr) => {
    res.render('categories/clothing', {
      user: req.user,
      currency: curr[0]
    })
  })   
})

})
router.post('/search', ensureAuthenticated, (req, res) => {
  unirest.get("https://webknox-search.p.rapidapi.com/webpage/search?number=10&language=en&query="+req.body.key.split(' ').filter(Boolean).join('+'))
  .header("X-RapidAPI-Host", "webknox-search.p.rapidapi.com")
  .header("X-RapidAPI-Key", "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691")
  .end(function (result) {
    res.json(result.body);
  });
})
module.exports = router;