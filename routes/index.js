const express = require ('express');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const router = express.Router();
router.get('/',(req,res)=>{
res.render('welcome', {
  user: req.user
});
})
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    res.render('dashboard', {
        user: req.user
      })})
module.exports = router;