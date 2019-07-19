const express = require('express');
const unirest = require('unirest');
var encodeUrl = require('encodeurl')

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
  res.render('categories/clothing', {
    user: req.user
  })
})
router.post('/search', ensureAuthenticated, (req, res) => {
  unirest.get("https://webknox-search.p.rapidapi.com/webpage/search?number=10&language=en&query=" + req.body.key.split(' ').filter(Boolean).join('+'))
    .header("X-RapidAPI-Host", "webknox-search.p.rapidapi.com")
    .header("X-RapidAPI-Key", "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691")
    .end(function (result) {
      var FirstUrl = [];
      if (result.body.length) {
        for (var i = 0; i < result.body.length; i++) {
          FirstUrl.push(getPlainText(result.body[i].url));
        }
      }
      Promise.all(FirstUrl).then(function (result) {
        var SplitedtextArr = [];
        for (var i = 0; i < result.length; i++) {
          if (result[i]) {
            SplitedtextArr.push(result[i].replace(/\n/g, '').match(/.{1,5000}/g).join('').match(/.{1,5000}/g));
          }
        };
        textAnalysis(SplitedtextArr.flat(2)).then(function (text) {
          text=text.filter(Boolean);
          var reviews =[];
          for (var i = 0; i < text.length; i++) {
            if (text[i]) {
              reviews.push(text[i]);
            }
          };
          res.json(reviews);
        })
      });
    });
});
function getPlainText(url) {
  var encodedurl = encodeUrl(url);
  return new Promise(function (resolve, reject) {
    unirest.get("https://scraper-io.p.rapidapi.com/v1/text?url=" + encodedurl)
      .header("X-RapidAPI-Host", "scraper-io.p.rapidapi.com")
      .header("X-RapidAPI-Key", "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691")
      .end(function (result) {
        if (result.status == 200) {
          resolve(result.body)
        }
        else {
          resolve('')
        }
      });
  });

}
function textAnalysis(textarr) {
  var textArrPromises = [];
  for (var i = 0; i < textarr.length; i++) {
    if (textarr[i]) {
      textArrPromises.push(
        new Promise(function (resolve, reject) {
          unirest.get("https://aylien-text.p.rapidapi.com/sentiment?text=" + textarr[i].split(' ').filter(Boolean).join('+'))
            .header("X-RapidAPI-Host", "aylien-text.p.rapidapi.com")
            .header("X-RapidAPI-Key", "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691")
            .end(function (result) {
              if (result.status == 200) {
                resolve(result.body)
              }
              else {
                resolve('')
              }
            })
        })
      )
    }
  }
  return Promise.all(textArrPromises);
}
module.exports = router;