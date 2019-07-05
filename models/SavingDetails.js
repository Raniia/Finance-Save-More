const mongoose = require('mongoose');
const savingDetailsSchema = new mongoose.Schema({
    monthlyIncome:{type:String,required:true},
    currencies:{type:String,required:true},
    livingExpenses:{type:String,required:false},
    monthlyBills:{type:String,required:true},
    bankAccount:{type:String,required:true},
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
})
const SavingDetails = mongoose.model('SavingDetails', savingDetailsSchema);
module.exports = SavingDetails;
