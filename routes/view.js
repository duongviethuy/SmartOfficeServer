const express = require('express');
const router = express.Router();

//#5F002B

router.get('/', (req, res) => {
    res.render('index/home', {})
})

router.get('/adduser', (req, res) => {
    res.render('index/adduser')
})

router.get('/log', (req, res) => {
    res.render('index/log')
})

router.get('/EmployeeRegister', (req, res) => {
    res.render('index/EmployeeRegister')
})

router.get('/employeeManagent', (req, res) => {
    res.render('index/employeeManagent')
})

router.get('/worksdaycount', (req, res) => {
    res.render('index/worksdaycount')
})

module.exports = router