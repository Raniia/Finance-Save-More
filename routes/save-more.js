const express = require('express');
const router = express.Router();
const passport = require('passport');
const Currency = require('../models/Currency');
const SavingDetails = require('../models/SavingDetails');
const User = require('../models/User');
const Item = require('../models/Item');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/save-more', ensureAuthenticated, (req, res) => {
    SavingDetails.find({ user: req.user }).then((response) => {

        if (response.length) {
            const currencySelected = response[0].currencies;
            Currency.find({ code: currencySelected }).then((curr) => {
                res.render('items', {
                    user: req.user,
                    currency: curr[0].code + ' (' + curr[0].symbol_native + ')'
                });
            })
        }
        else {
            Currency.find({}).then((currencies) => {
                res.render('save-more', { currencies, user: req.user });
            });
        }
    });

});
router.post('/save-more', ensureAuthenticated, (req, res) => {
    const { monthlyIncome, currencies, livingExpenses, monthlyBills, bankAccount } = req.body;
    const user = req.user;
    const savingDetails = new SavingDetails({ monthlyIncome, currencies, livingExpenses, monthlyBills, bankAccount, user });
    // User.findOne({email:req.user.email}).then((user)=>{
    //     console.log(user);
    // });
    savingDetails.save().then(details => {
        res.json(details);
    }).catch(err => console.log(err));
});

router.post('/save-items', ensureAuthenticated, (req, res) => {
    const { name, price, date } = req.body;
    const savedSoFar = "0";
    const user = req.user;
    const item = new Item({ name, price, savedSoFar, date, user });
    item.save().then(details => {
        res.json(details);
    }).catch(err => console.log(err));
});

module.exports = router;