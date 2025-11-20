const express = require('express')
const app = express()
const path = require('path')

const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const cookieParser = require('cookie-parser')
app.use(cookieParser())

//static duong dan /
app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/SOS');

app.use('/', require('./routes/view'))
app.use('/api', require('./routes/api'))

app.use((req, res, next) => {
    res.status(404).send('Trang không tồn tại');
})

app.listen(3000)
