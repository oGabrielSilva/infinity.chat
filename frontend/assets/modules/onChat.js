function onChat(data, meOrSystem) {
    const div = document.createElement('div')
    div.innerHTML = `
        <div class="message${meOrSystem ? '-me' : '-others'}">
            <span>
                <strong>${String(data.nick)}</strong><br>
                <small>${String(data.message)}</small>
            </span>    
        </div>
    `
    return div 
}

export { onChat }
