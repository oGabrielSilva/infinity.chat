function createChat(room) {
    const div = document.createElement('div')
    div.classList.add('mb-4', 'p-3', 'bg-white', 'rounded', 'shadow-sm')
    div.innerHTML = `
        <p class="h5 border-bottom mb-4 p-3">Sala: ${room}</p>
        <div class="p-3 mb-4 bg-light rounded shadow-sm" id="chat"></div>
        <textarea rows="2"></textarea>
        <button style="width: auto;" class="btn btn-primary">Enviar</button>
    `
    return div
}

export { createChat }
