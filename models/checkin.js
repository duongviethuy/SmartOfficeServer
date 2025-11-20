const mongoose  = require("mongoose");

function NowtoYY_MM_DD () {
    var currentDate = new Date()
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Tháng bắt đầu từ 0, nên cộng thêm 1
    const day = currentDate.getDate();
    return year + '-' + month + '-' + day
}

const checkin = new mongoose.Schema({    
    date: {type: Date, default: NowtoYY_MM_DD (), unique: true, required: true},
    employee: [{
        userID: String,
        cardID: String,
        checkin_time: { type: Date },
        checkout_time: { type: Date },
        workdayCount: Number,
        worktimeCount: Number,
    }]
    
})



module.exports = mongoose.model('checkin', checkin)