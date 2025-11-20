const mongoose  = require("mongoose");

const user = new mongoose.Schema({
    userIMG: String,
    userID: String,
    fullName: String,
    position: String,
    email: String,
    cardID: String,
    createAt: {type: Date, default: Date.now}
})


module.exports = mongoose.model('user', user)