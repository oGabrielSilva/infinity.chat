require('dotenv').config()
const express = require('express')
const path = require('path')
const helmet = require('helmet')
const csrf = require('csurf')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTSTRING, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false }).then(() => {
        app.emit('connect')
    }).catch(e => console.log('Deu erro', e))

const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const routes = require('./routes')

const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/global')

app.use(helmet())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'public')))

const sessionConfig = session({
    secret: 'Exemplo',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
})
app.use(sessionConfig)
app.use(flash())

app.set('views', path.resolve(__dirname, 'src', 'views'))
app.set('view engine', 'ejs')

app.use(csrf())
app.use(middlewareGlobal)
app.use(csrfMiddleware)
app.use(checkCsrfError)
app.use(routes)

//Socket
const defaultRoom = 'off-topic'
const shareRoom = 'share topic'

io.on('connection', socket => {
    socket.on('connect room', data => {
        if(!data || !data.name || !data.room || data.name.length < 3 || data.name.length > 25) return
        if(data.room === defaultRoom) {
            socket.join(defaultRoom)
            socket.emit('render chat')
            return io.to(defaultRoom).emit('message', { nick: `${data.name}`, message: 'Entrou na sala.' })
        }
        return socket.to(data.room).emit('connect private')
    })

    socket.on('search rooms', () => {
        return socket.join(shareRoom)
    })

    socket.on('share id', data => {
        socket.to(shareRoom).emit('sharing', data)
    })

    socket.on('send message', data => {
        const { nick, message, room } = data
        return socket.to(room).emit('message', { nick, message })
    })

    socket.on('success', data => socket.to(data).emit('success'))

    socket.on('permission to open chat', data => {
        const { value, postman } = data
        return socket.to(data.id).emit('permission', { value, postman })
    })
})

app.on('connect', () => {
    http.listen(3000, () => {
        console.log('Servidor online.', 'http://127.0.0.1:3000')
    })
})
