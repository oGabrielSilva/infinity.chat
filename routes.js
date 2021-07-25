const express = require('express')
const route = express.Router()
const home = require('./src/controllers/home')
const login = require('./src/controllers/login')
const room = require('./src/controllers/room')

const { loginRequired } = require('./src/middlewares/global')

//rotas da home
route.get('/', home.index)

//rotas de login
route.get('/login', login.index)
route.post('/login/new', login.register)
route.post('/login/entry', login.entry)
route.get('/login/out', login.out)

//rotas das rooms
route.get('/room/offtopic', room.index)
route.get('/room/private', loginRequired, room.entry)
route.get('/room/sharing', loginRequired, room.share)

module.exports = route
