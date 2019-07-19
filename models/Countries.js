const mongoose = require('mongoose');
const countriesSchema = new mongoose.Schema({
    name:{type:String,required:true},
    code:{type:String,required:true}

})
const Countries = mongoose.model('Countries', countriesSchema);

module.exports = Countries;
