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
            Promise.all([Item.find({user: req.user }).then((items)=>{
                return items;
            }),Currency.find({ code: currencySelected }).then((curr) => {
                return curr;
            })]).then((data)=>{
                res.render('items', {
                    user: req.user,
                    currency: data[1][0],
                    items:calculateItemsEndDate(data[0],response[0]),
                    savingDetails:response[0]
                });
            });

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
router.put('/save-more', ensureAuthenticated, (req, res) => {
    const { monthlyIncome, livingExpenses, monthlyBills, bankAccount } = req.body;
    SavingDetails.findOneAndUpdate({user: req.user}, { monthlyIncome, livingExpenses, monthlyBills, bankAccount } , {upsert:true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        return res.send("Succesfully saved");
    });
});


router.post('/save-items', ensureAuthenticated, (req, res) => {
    const { name, price, date } = req.body;
    const savedSoFar = "0";
    const user = req.user;
    const item = new Item({ name, price, savedSoFar, date, user });
    item.save().then(details => {
        Promise.all([
        Item.find({user: req.user }).then((items)=>{
            return items;
        }),
        SavingDetails.find({ user: req.user }).then((response) => {
            return response;
        })
    ]).then((data)=>{
        Currency.find({ code: data[1][0].currencies }).then((curr) => {
            res.render('items', {
                user: req.user,
                currency: curr[0].code + ' (' + curr[0].symbol_native + ')',
                items:calculateItemsEndDate(data[0],data[1][0]),
                savingDetails:data[1][0]
            });
        })
    })

    }).catch(err => console.log(err));
});

router.delete('/save-items', ensureAuthenticated,(req, res) => {
    Item.findOneAndRemove({ _id: req.body._id }, function(err) {
        if (err) return res.send(500, { error: err });
        return res.send("Succesfully deleted");
    });
});
function dhm(t) {
    var cd = 24 * 60 * 60 * 1000,
        ch = 60 * 60 * 1000,
        d = Math.floor(t / cd),
        h = Math.floor((t - d * cd) / ch),
        m = Math.round((t - d * cd - h * ch) / 60000),
        pad = function (n) { return n < 10 ? '0' + n : n; };
    if (m === 60) {
        h++;
        m = 0;
    }
    if (h === 24) {
        d++;
        h = 0;
    }
    return [d, pad(h), pad(m)].join(':');
}
function calculateItemPriority(items) {
    for (var i = 0; i < items.length; i++) {
        var diff = Math.abs(new Date() - new Date(items[i].date));
        items[i].daysToBuy = Number(dhm(diff).split(':')[0]);
    }
    var sumDays = items.reduce((accumulator, currentValue) => accumulator + currentValue.daysToBuy, 0)
    for (var j = 0; j < items.length; j++) {
        items[j].itemPriority = sumDays / items[j].daysToBuy;
    }
    var sumPrio = items.reduce((accumulator, currentValue) => accumulator + currentValue.itemPriority, 0)
    for (var x = 0; x < items.length; x++) {
        items[x].priorityPerc = (items[x].itemPriority / sumPrio) * 100;
    }
    return items;
}
function getItemTime(savingDetails, item) {
    item.savedSoFar = Number(item.savedSoFar) + (item.priorityPerc / 100 * savingDetails.bankAccount);
    if (savingDetails.bankAccountAfter == undefined) {
        savingDetails.bankAccountAfter = 0;
    }
    if (item.savedSoFar > Number(item.price)) {
        savingDetails.bankAccountAfter = savingDetails.bankAccountAfter + (item.savedSoFar - item.price);
        item.savedSoFar -= (item.savedSoFar - item.price);
    }
    return item;
}
function checkIfThereIsStillItems(items) {
    let remainingItems = [];
    for (var x = 0; x < items.length; x++) {
        if (items[x].savedSoFar != items[x].price) {
            remainingItems.push(items[x]);
        }
    }
    return remainingItems;
}
function calculateItemsEndDate(items, savingDetails) {
    items = calculateItemPriority(items);
    for (var x = 0; x < items.length; x++) {
        items[x] = getItemTime(savingDetails, items[x]);
    }
    var remainingItems = checkIfThereIsStillItems(items);
    if (remainingItems.length) {
        if (savingDetails.bankAccountAfter) {
            savingDetails.bankAccount = savingDetails.bankAccountAfter;
            savingDetails.bankAccountAfter=0;
        }
        else {
            savingDetails.bankAccountAfter = (savingDetails.monthlyIncome - savingDetails.livingExpenses);
            savingDetails.bankAccount = savingDetails.bankAccountAfter;
            for (var j = 0; j < items.length; j++) {
                items[j].remaining = items[j].remaining ?  (items[j].remaining+1) : 1;
            }
        }
        calculateItemsEndDate(remainingItems, savingDetails);
    }
    return items;
console.log(items);
}
module.exports = router;