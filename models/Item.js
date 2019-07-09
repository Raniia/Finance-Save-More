const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    name:{type:String,required:true},
    price:{type:String,required:true},
    savedSoFar:{type:String,required:false},
    dueDate:{type:Date, required:true},
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }

})
const Item = mongoose.model('Item', itemSchema);
module.exports = Item;