function personName(e, nick, socket, room) {
    e.preventDefault()
    const name = e.target.querySelector('#name').value
    nick.push(name)
    if(!name || name.length < 3 || name.length > 25) return
    return socket.emit('connect room', { name, room })
}

export { personName }
