import { io } from "socket.io-client"

//Modules JS
import { personName } from './personName'
import { createChat } from './createChat'
import { onChat } from './onChat'

const socket = io()
const main = document.querySelector('main')
const room = main.querySelector('#room') ? main.querySelector('#room').value : ''
const nick = []
// const audio = new Audio('/assets/sound/notification.mp3')

function sendMessage(name = nick, postman = room) {
    const camp = main.querySelector('textarea')
    const message = camp.value
    if (!message) return
    camp.value = ''
    const chat = main.querySelector('#chat')
    const nick = name
    const room = postman
    chat.appendChild(onChat({ nick, message }, true))
    chat.scrollTop = chat.scrollHeight;
    socket.emit('send message', { nick, message, room })
}

function ioServer() {
    main.querySelector('.person-info').querySelector('form').
        addEventListener('submit', e => personName(e, nick, socket, room))

    socket.on('render chat', () => {
        if (main.querySelector('#chat')) return
        const div = createChat(room)
        main.querySelector('.person-info').remove()
        main.appendChild(div)
        main.querySelector('button').addEventListener('click', () => sendMessage(nick, room))
    })

    socket.on('message', data => {
        const chat = main.querySelector('#chat')

        if (!chat) return
        chat.appendChild(onChat(data))
        chat.scrollTop = chat.scrollHeight;
    })

}

// ---------------------------------------------------------------------------------------------- //

function ioPrivateServer() {
    let controller = false
    const user = main.querySelector('#userSocketId')
    const copy = main.querySelector('#copy')
    const share = main.querySelector('#share')
    const userId = main.querySelector('#nameId')
    const id = []

    socket.on('message', data => {
        const chat = main.querySelector('#chat')

        if (!chat) return
        chat.appendChild(onChat(data))
        chat.scrollTop = chat.scrollHeight;
    })


    socket.on('permission', data => {
        const { postman } = data
        const date = new Date().toLocaleString('pt-BR').split(' ')
        const div = document.createElement('div')
        div.classList.add('mb-4', 'p-3', 'bg-light', 'rounded', 'shadow-sm')
        div.innerHTML = `
            <p class="h5">${data.value} quer abrir um chat com você. Aceitar?</p>
            <small class="text-muted">${date[1]}</small><br>
            <button class="btn btn-success mt-2">Aceitar</button>
            <button class="btn btn-danger mt-2">Recusar</button> <br>
        `
        div.addEventListener('click', e => {
            if (!e.target.classList.contains('btn')) return
            const permission = e.target.innerText === 'Aceitar' ? true : false
            if (!permission) return e.target.parentElement.remove()
            socket.emit('success', postman)
            const chat = createChat(data.value)
            const nick = userId.value
            main.innerHTML = ''
            main.appendChild(chat)
            main.querySelector('button').addEventListener('click', () => sendMessage(nick, postman))
        })
        main.querySelector('#index').appendChild(div)
    })

    socket.on("connect", () => {
        user.value = socket.id
        id.push(socket.id)
        share.addEventListener('click', shareId)
    });

    function shareId() {
        if (controller) return
        const name = userId.value
        if (!name || name.length > 25 || name.length < 3 || typeof name !== 'string') return userId.focus()
        controller = true
        share.classList.remove('btn-primary')
        share.classList.add('btn-secondary')
        socket.emit('share id', { id, name })
    }

    copy.addEventListener('click', () => navigator.clipboard.writeText(user.value).then(() => user.focus()))
}

// ---------------------------------------------------------------------------------------------- //

function ioSearch() {
    const random = (x, y) => Math.floor(Math.random() * (x - y + 1)) + y
    const form = main.querySelector('.form-controller-chat')
    let aux = 0
    const ids = [];
    const list = main.querySelector('#list-group')

    socket.on('success', () => {
        const textarea = main.querySelector('textarea')
        textarea.removeAttribute('readonly')
        textarea.removeAttribute('placeholder')
        const chat = main.querySelector('#chat')

        if (!chat) return
        chat.appendChild(onChat({ nick: 'Infinity', message: 'Seu pedido de chat foi aceito' }))
        chat.scrollTop = chat.scrollHeight;
    })


    socket.on('message', data => {
        const chat = main.querySelector('#chat')

        if (!chat) return
        chat.appendChild(onChat(data))
        chat.scrollTop = chat.scrollHeight;
    })


    form.addEventListener('submit', e => {
        e.preventDefault()
        const id = form.querySelector('input')
        if (!id.value) return id.focus()
        aux = aux + 100
        const val = String('S' + random(9999999999, 1000000000)) + String((aux + aux ** 2) + 123312) + 's'
        ids.push({ id: id.value, idObj: val })
        const div = createChat(val)
        const input = document.createElement('input')
        input.setAttribute('value', val)
        input.setAttribute('type', 'hidden')
        div.appendChild(input)
        main.innerHTML = ''
        main.appendChild(div)
        main.querySelector('textarea').setAttribute('readonly', '')
        main.querySelector('textarea').setAttribute('placeholder', `Aguardando ${val.name} aceitar`)
        return setChat()
    })

    function setChat() {
        const parent = main.querySelector('input').parentElement
        parent.style.display = 'none'
        let nick = null;

        const div = document.createElement('div')
        div.classList.add('p-3', 'bg-white', 'rounded', 'shadow-sm')
        div.innerHTML = `
            <form id="div">
                <p class="h5">Coloque suas informações</p>
                <div class="form-group">
                    <label for="name">Nome</label>
                    <input required minlength="3" maxlength="25" type="text" class="form-control" 
                        id="name" placeholder="Seu nome">
                </div>
                <button type="submit" class="btn btn-primary mt-4">Entrar</button>
            </form>
        `

        parent.parentElement.appendChild(div)
        parent.parentElement.querySelector('#div').addEventListener('submit', e => {
            e.preventDefault()
            let id = main.querySelector('input').value

            for (let val of ids) {
                if (val.idObj === id) id = val.id
            }

            const postman = socket.id
            const form = e.target
            const value = form.querySelector('#name').value
            if (!value || typeof value !== 'string' || value.length > 25 || value.length < 3) return
            nick = value
            parent.parentElement.querySelector('#div').remove()
            parent.removeAttribute('style')
            socket.emit('permission to open chat', { value, postman, id })
        })

        parent.querySelector('button').addEventListener('click', () => {
            const isId = parent.querySelector('input').value
            ids.forEach(val => {
                if (val.idObj === isId) {
                    const room = val.id
                    sendMessage(nick, room)
                    parent.querySelector('textarea').value = ''
                }
            })
        })

    }

    socket.emit('search rooms')
    socket.on('sharing', datas => {
        aux = aux + 100
        const idObj = String('S' + random(9999999999, 1000000000)) + String((aux + aux ** 2) + 123312) + 's'
        const data = `<div id="${idObj}" class="list-group-item list-group-item-action">${String(datas.name)}</div>`
        ids.push({ ...datas, idObj })
        if (ids.length > 10) ids.shift()
        list.innerHTML = data + list.innerHTML
    })

    list.addEventListener('click', e => {
        if (!e.target.classList.contains('list-group-item-action')) return
        const id = e.target.getAttribute('id')
        ids.forEach(val => {
            if (val.idObj === id) {
                const div = createChat(val.name)
                const input = document.createElement('input')
                input.setAttribute('value', val.idObj)
                input.setAttribute('type', 'hidden')
                list.parentElement.classList.remove('p-3')
                div.appendChild(input)
                list.parentElement.querySelector('p').remove()
                list.parentElement.querySelector('div').remove()
                list.parentElement.appendChild(div)
                main.querySelector('textarea').setAttribute('readonly', '')
                main.querySelector('textarea').setAttribute('placeholder', `Aguardando ${val.name} aceitar`)
                list.remove()
                return setChat()
            }
            return
        })
    })
}

export { ioServer, ioPrivateServer, ioSearch }