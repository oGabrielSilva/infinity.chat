const Login = require('../models/Login')

exports.index = (req, res) => {
    if(req.session.user) return res.render('index-log')
    return res.render('login')
}

exports.register = async (req, res) => {
    try {
        const login = new Login(req.body)
        await login.register()

        if(login.errors.length > 0) {
            req.flash('errors', login.errors)
            req.session.save(function() {
                return res.redirect('/login')
            })
            return
        }

        req.flash('success', 'Sua conta foi criada com sucesso.')
        req.session.save(function() {
            return res.redirect('/login')
        })
        return
    } catch (e) {
        console.log(e)
        res.render('404')
    }
}

exports.entry = async (req, res) => {
    try {
        const login = new Login(req.body)
        await login.enter()

        if(login.errors.length > 0) {
            req.flash('errors', login.errors)
            req.session.save(function() {
                return res.redirect('/login')
            })
            return
        }

        req.flash('success', 'Login realizado com sucesso.')
        req.session.user = login.user
        req.session.save(function() {
            return res.redirect('/login')
        })
        return
    } catch (e) {
        console.log(e)
        res.render('404')
    }
}

exports.out = (req, res) => {
    req.session.destroy()
    res.redirect('/')
}
