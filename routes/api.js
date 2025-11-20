const express = require('express');
const router = express.Router();

const user = require('../models/user')
const car_image = require('../models/car_image')
const checkin = require('../models/checkin')

const moment = require('moment');

var officeStatus

var queryCardID


function NowtoYY_MM_DD () {
    var currentDate = new Date()
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    return year + '-' + month + '-' + day
}

router.get('/checkUserID/:id', async (req, res) => {
    let userID = req.params.id
    foundUser = await user.findOne({userID: userID})

    if (foundUser) {
        res.json({
            'userIMG': foundUser.userIMG,
            'userID': foundUser.userID,
            'fullName': foundUser.fullName,
            'postion': foundUser.position,
            'exist': true
        })
    }
    else {
        res.json({
            'exist': false
        })
    }
})

router.post('/officeStatus', (req, res) => {
    officeStatus = req.body
    res.end()  
})

router.get('/officeStatus', (req, res) => {
    res.json(officeStatus)
})

router.get('/cardAuthorized', async (req, res, next) => {
    queryCardID = req.body.cardID
    if(queryCardID === undefined) {
        queryCardID = 'null'
    }
    const foundUser = await user.findOne({cardID: queryCardID})
    if(foundUser) {
        res.json({
            "fullName" : foundUser.fullName,
            "cardAuthorized" : true
        })
    }
    else {
        res.json({
            "cardAuthorized" : false
        })
    }    
})

router.post('/captureImg', async (req, res) => {
    let img_capture = req.body.img
    await car_image.create({
        'img_data': img_capture,
        'time_in': moment().toDate(),
        'time_out': moment().toDate(),
        'cardID': queryCardID
    })
    res.end()
})

router.get('/recentCar', async (req, res) => {
    
    try {
        let img_capture = await car_image.findOne().sort({ createdAt: -1 })
        const foundUser = await user.findOne({cardID: img_capture.cardID})
        res.json({
            "img_data" : img_capture.img_data,
            "user": foundUser.fullName
        })
    }
    catch(error) {
        res.json({})
    }   
})

router.get('/car-log', async (req, res) => {
    let car_log = await car_image.find().sort({ createdAt: -1 }).limit(20).exec()
    let new_car_log = [];

    for (const [index, log] of car_log.entries()) {
        const foundUser = await user.findOne({ cardID: log.cardID });
        new_car_log[index] = { ...log, fullName: foundUser.fullName };
    }    
    res.json(new_car_log)
})

router.delete('/delete-car-log', async(req, res) => {
    await car_image.deleteMany({})
    res.end('Delete car log successful')
})
var reqRegister = false

router.post('/reqRegisterCard', (req, res) => {
    reqRegister = true
    res.end()
})

var cardIDSearch = ''

router.post('/cardID', (req, res) => {   
    cardIDSearch = req.body.cardID
    reqRegister = false
    res.end()
})

router.get('/cardID', async (req, res) => {
    const foundCard = await user.findOne({cardID: cardIDSearch}) 
    if(!foundCard) {        
        res.json({
            'used': false, 
            'cardID': cardIDSearch
        })  
    }
    else {        
        res.json({
            'used': true, 
            'cardID': cardIDSearch
        })  
    }
    cardIDSearch = ''
})

router.get('/reqRegisterCard', (req, res) => {
    res.json({
        "reqRegister": reqRegister
    })
})

router.post('/addEmployee', async (req, res) => {
    user.create(req.body)
    await checkin.updateOne({date: NowtoYY_MM_DD ()}, {
        $push: {
            'employee': {
                cardID: req.body.cardID,
                userID:  req.body.userID,
                checkin_time : null,
                checkout_time: null,
            }
        }
    }).then(e => {})
    res.end("Successfull !!!")
})

router.get('/workDate/:date', async (req, res) => {
    const queryDate = new Date(req.params.date)
    let checkinday = await checkin.findOne({date: queryDate}) 
    if(checkinday === null) {
        checkin.create({ date: NowtoYY_MM_DD () })
        let userlist = await user.find({})
        userlist.forEach( async (user) => {
            await checkin.updateOne({ date: NowtoYY_MM_DD () }, {
                $push: {
                    'employee': {
                        cardID: user.cardID,
                        userID: user.userID,
                        checkin_time : null,
                        checkout_time: null,
                    }
                }
            })

        })
        checkinday = await checkin.findOne({date: queryDate}) 
        res.json(checkinday)
    }   
    else {
        res.json(checkinday)
    }
})

router.get('/getallcheckinlist', async (req, res)=> {
    let checkinlist = await checkin.find({})
    res.json(checkinlist)
})

router.get('/checkin', async (req, res) => {    
    queryCardID = req.body.cardID
    if(queryCardID === undefined) {
        queryCardID = 'null'
    }
    const foundUser = await user.findOne({cardID: queryCardID})

    if(foundUser) {
        let checkinlist = await checkin.findOne({date: NowtoYY_MM_DD ()})   

        if(checkinlist === null) {
            checkin.create({ date: NowtoYY_MM_DD () })
            let userlist = await user.find({})
            userlist.forEach( async (user) => {
                await checkin.updateOne({ date: NowtoYY_MM_DD () }, {
                    $push: {
                        'employee': {
                            cardID: user.cardID,
                            userID: user.userID,
                            checkin_time : null,
                            checkout_time: null,
                        }
                    }
                })
            })
            checkinlist = await checkin.findOne({date: NowtoYY_MM_DD ()})   
            checkinlist.employee.forEach(async emp => {
                if (emp.userID === foundUser.userID) {
                    if(emp.checkin_time === null) {
                        await checkin.updateOne({date: NowtoYY_MM_DD (), 'employee.userID' : foundUser.userID}, {
                            $set: {
                                'employee.$.checkin_time': moment()
                            }
                        }).then((e) => {})

                    }
                }
            })
        }
        else {
            checkinlist.employee.forEach(async emp => {
                if (emp.userID === foundUser.userID) {
                    if(emp.checkin_time === null) {
                        await checkin.updateOne({date: NowtoYY_MM_DD (), 'employee.userID' : foundUser.userID}, {
                            $set: {
                                'employee.$.checkin_time': moment()
                            }
                        }).then((e) => {})
                    }
                    else {
                        await checkin.updateOne({date: NowtoYY_MM_DD (), 'employee.userID' : foundUser.userID}, {
                            $set: {
                                'employee.$.checkout_time': moment()
                            }
                        }).then((e) => {})
                    }
                }
            })
        }
       
        res.json({
            "fullName" : foundUser.fullName,
            "cardAuthorized" : true
        })
    }
    else {
        res.json({
            "cardAuthorized" : false
        })
    }    
})

router.get('/getallcheckinlist', async (req, res)=> {
    let checkinlist = await checkin.find({})
    res.json(checkinlist)
})

module.exports = router