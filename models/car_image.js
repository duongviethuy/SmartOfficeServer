const mongoose  = require("mongoose");

const car_image = new mongoose.Schema({
    img_data: String,
    time_in: Date,
    time_out: Date,
    cardID: String,
    createdAt: { type: Date, default: Date.now }
})



module.exports = mongoose.model('car_image', car_image)