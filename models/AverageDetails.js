const mongoose = require("mongoose");
const averageDetailsSchema = new mongoose.Schema({
  country: { type: String, required: true },
  quality_average: [
    {
      type: String,
      required: true
    }
  ],
  price: [
    {
      type: String,
      required: true
    }
  ]
});
const AverageDetails = mongoose.model("AverageDetails", averageDetailsSchema);

module.exports = AverageDetails;
