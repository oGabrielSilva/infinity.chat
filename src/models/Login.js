const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs') 

const LoginSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now }
})

const LoginModel = mongoose.model('Login', LoginSchema)

class Login {
    constructor(body) {
        this.body = body
        this.errors = []
        this.user = null
    }

    async enter() {
        this.valid()
        if(this.errors.length > 0) return;
        this.user = await LoginModel.findOne({ email: this.body.email })
        if(!this.user) {
            this.errors.push('Usuário ou senha incorretos.')
            return
        }
        if(!bcryptjs.compareSync(this.body.password, this.user.password)) {
            this.errors.push('Usuário ou senha incorretos.')
            this.user = null
            return
        }
    }

    async register() {
        this.valid()
        if(!this.body.name) this.errors.push('Nome inválido.')
        if(this.errors.length > 0) return;
        
        await this.userExists()

        if(this.errors.length > 0) return;
        const salt = bcryptjs.genSaltSync()
        this.body.password = bcryptjs.hashSync(this.body.password, salt)
        this.user = await LoginModel.create(this.body)
    }

    async userExists() {
        this.user = await LoginModel.findOne({ email: this.body.email })
        if(this.user) this.errors.push('E-mail já cadastrado em nosso banco de dados.')
    }

    valid() {
        this.cleanUp()

        if(!validator.isEmail(this.body.email)) this.errors.push('E-mail inválido')
        if(this.body.password.length < 8 || this.body.password.length > 50) {
            this.errors.push('A senha precisa ter entre 8 e 25 caracteres.')
        }
    }

    cleanUp() {
        for(let key in this.body) {
            if(typeof this.body[key] !== 'string') {
                this.body[key] = ''
            }
        }

        this.body = {
            name: this.body.name,
            email: this.body.email,
            password: this.body.password
        }
    }
}

module.exports = Login;
