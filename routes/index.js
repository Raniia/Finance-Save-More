const express = require("express");
const unirest = require("unirest");
var encodeUrl = require("encodeurl");
const Currency = require("../models/Currency");
const SavingDetails = require("../models/SavingDetails");
const AverageDetails = require("../models/AverageDetails");
const Nexmo = require('nexmo');

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

const router = express.Router();
router.get("/", (req, res) => {
  res.render("welcome", {
    user: req.user
  });
});
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", {
    user: req.user
  });
});
router.get("/why-us", (req, res) => {
  res.render("why-us", {
    user: req.user
  });
});
router.get("/review", (req, res) => {
  res.render("review", {
  });
});
router.get("/contact-us", (req, res) => {
  res.render("contact-us", {
    user: req.user
  });
});
router.get("/buy-or-not", ensureAuthenticated, (req, res) => {
  res.render("buy-or-not", {
    user: req.user
  });
});
router.get("/categories/under-construction", ensureAuthenticated, (req, res) => {
  res.render("categories/under-construction", {
    user: req.user
  });
});
router.get("/categories/clothing", ensureAuthenticated, (req, res) => {
  res.render("categories/clothing", {
    user: req.user,
  });
});
router.post("/askUsers", ensureAuthenticated, (req, res) => {
  const nexmo = new Nexmo({
    apiKey: '9a808a22',
    apiSecret: 'yl532Rcitvc9xZUq',
  });
  nexmo.message.sendSms('smartPiggy', '201064957396', `Hello link: http://localhost:4000/review?id=${req.user.id}`)
  res.json({id:req.user.id,url:`http://localhost:4000/review?id=${req.user.id}`});

});
  router.post("/submitReview", (req, res) => {

    io.emit( req.body.id,  req.body.review);
  
  res.json({msg: `thanks for you review`});
});

router.post("/search", ensureAuthenticated, (req, res) => {
 unirest.get("https://google-search1.p.rapidapi.com/google-search")
 .query({
      "q": (req.body.key + " reviews").trim(),
      "hl": "en",
      "gl": "eg"
  }).headers({
      "x-rapidapi-host": "google-search1.p.rapidapi.com",
      "x-rapidapi-key": "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691"
  }).end(function(result) {
    console.log(result.body,'hah')
      var FirstUrl = [];
      if (result.body.organic &&result.body.organic.length) {
        for (var i = 0; i < result.body.organic.length; i++) {
          FirstUrl.push(getPlainText(result.body.organic[i].url));
        }
      }
      Promise.all(FirstUrl).then(function(result) {
        var SplitedtextArr = [];
        for (var i = 0; i < result.length; i++) {
          if (result[i] && result[i].text) {
            SplitedtextArr.push(
              result[i].text
                .replace(/\n/g, "")
                .match(/.{1,5000}/g)
                .join("")
                .match(/.{1,5000}/g)
            );
          }
        }
        SplitedtextArr = [].concat.apply([], SplitedtextArr);
        console.log(SplitedtextArr,'testtestets');
        textAnalysis(SplitedtextArr).then(function(text) {
          console.log(text,"heyheyhey")
          text = text.filter(Boolean);
          var reviews = [];
          for (var i = 0; i < text.length; i++) {
            if (text[i]) {
              reviews.push(text[i].polarity);
            }
          }
          res.json(calculateReviews(reviews));
        });
      });
    });
});

router.post("/quizAnswers", ensureAuthenticated, (req, res) => {
  AverageDetails.find({ country: req.user.country }).then(response => {
    var result = calculateAverageLifetime(req.body, response[0]);
    res.json({res:result});
  });
});


function calculateAverageLifetime(userData, countryData) {
  switch (userData.rate) {
    case "1":
      var price = countryData.price[0].split("-").map(function(val) {
        return Number(val);
      });
      if (userData.price <= price[1]) {
        return  getBestPrice(countryData.payPerDayAvg,
          calculateAveragePrices(userData.price +'-'+userData.price,
           countryData.quality_average[0]),userData.timesPerWeek,
           userData.rate);
      } else {
        return "don't buy";
      }
      break;
    case "2":
      var price = countryData.price[1].split("-").map(function(val) {
        return Number(val);
      });
      if (userData.price > price[1]) {
        return "don't buy";
      } else {
        return   getBestPrice(countryData.payPerDayAvg,
          calculateAveragePrices(userData.price +'-'+userData.price,
           countryData.quality_average[1]),userData.timesPerWeek,
           userData.rate);
      }
      break;
    case "3":
      var price = countryData.price[2].split("-").map(function(val) {
        return Number(val);
      });
      if (userData.price > price[1]) {
        return "don't buy";
      } else {
        return   getBestPrice(countryData.payPerDayAvg,
          calculateAveragePrices(userData.price +'-'+userData.price,
           countryData.quality_average[2]),userData.timesPerWeek,
           userData.rate);
      }
      break;
    case "4":
      var price = countryData.price[3].split("-").map(function(val) {
        return Number(val);
      });
      if (userData.price > price[1]) {
        return "don't buy";
      } else {
        return   getBestPrice(countryData.payPerDayAvg,
          calculateAveragePrices(userData.price +'-'+userData.price,
           countryData.quality_average[4]),userData.timesPerWeek,
           userData.rate);
      }
      break;
    case "5":
      var price = countryData.price[4].split("-").map(function(val) {
        return Number(val);
      });
      if (userData.price > price[1]) {
        return "don't buy";
      } else {
        return  getBestPrice(countryData.payPerDayAvg,
          calculateAveragePrices(userData.price +'-'+userData.price,
           countryData.quality_average[4]),userData.timesPerWeek,
           userData.rate);
      }
      break;
    default:
      console.log("oppsyyy!!");
  }
}
function calculateAveragePrices(price, duration) {
  var noOfDays = Number(duration);
  var pricePerDay = [];
  var avgPrice = price.split("-").map(function(val) {
    return Number(val);
  });
    avgPrice = (avgPrice[0]+avgPrice[1])/2;
    for(var x =1; x<8; x++) {
      var result =avgPrice/((noOfDays/(x*4*12))*365);
      pricePerDay.push(result);
    }
    return pricePerDay
}
function getBestPrice(countryPayPerDayAvg,arrayOfPricesOfDesiredItem, avgUse,UserRate) {
var strToComparePricesAndQuality = "";
var ratingOfBetterItems= [];
  for (var rate=0;rate<5;rate++){
    if((rate+1) != UserRate ){
    var rateOfItemBasedOnQuality=countryPayPerDayAvg[rate][avgUse-1];
    var rateOfItemUserWantToBuy=arrayOfPricesOfDesiredItem[avgUse-1];
    if((rateOfItemUserWantToBuy-rateOfItemBasedOnQuality)>0){
      ratingOfBetterItems.push({price: (rateOfItemUserWantToBuy-rateOfItemBasedOnQuality)*365,rate:rate+1});
      // strToComparePricesAndQuality += " item with rate "+ (rate+1) +" is better and will save "+(rateOfItemUserWantToBuy-rateOfItemBasedOnQuality)*365+ " per year"
    }
    }
  }
  return ratingOfBetterItems;
}

function getPlainText(url) {
  var encodedurl = encodeUrl(url);
  return new Promise(function(resolve, reject) {
    unirest.get( "https://scraper-io.p.rapidapi.com/v1/article")
    .query({
    "url": url
})
.headers({
    "x-rapidapi-host": "scraper-io.p.rapidapi.com",
    "x-rapidapi-key": "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691"
})
      .end(function(result) {
        if (result.status == 200) {
          resolve(result.body);
        } else {
          resolve("");
        }
      });
  });
}
function textAnalysis(textarr) {
  var textArrPromises = [];
  for (var i = 0; i < textarr.length; i++) {
    if (textarr[i]) {
      textArrPromises.push(
        new Promise(function(resolve, reject) {
          unirest.get("https://aylien-text.p.rapidapi.com/sentiment")
.query({
    "text":textarr[i].split(" ").filter(Boolean).join(" "),
    "mode": "tweet"
})
.headers({
    "x-rapidapi-host": "aylien-text.p.rapidapi.com",
    "x-rapidapi-key": "efba5145ebmsh7d3365d9680ac34p1c7934jsn2bd9b6ff3691"
})
            .end(function(result) {
              if (result.status == 200) {
                resolve(result.body);
              } else {
                resolve("");
              }
            });
        })
      );
    }
  }
  return Promise.all(textArrPromises);
}
function calculateReviews(arr) {
  let positiveCount = 0;
  let neturalCount = 0;
  let negativeCount = 0;
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == "positive") {
      positiveCount += 1;
    } else if (arr[i] == "neutral") {
      neturalCount += 1;
    } else {
      negativeCount += 1;
    }
  }
  return {
    positive: (positiveCount / arr.length) * 100,
    neutral: (neturalCount / arr.length) * 100,
    negative: (negativeCount / arr.length) * 100
  };
}
module.exports = router;
