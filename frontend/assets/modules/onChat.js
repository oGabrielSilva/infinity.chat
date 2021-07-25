function onChat(data, meOrSystem) {
    return `
        <div class="message${meOrSystem ? '-me' : '-others'}">
            <span>
                <strong>${String(data.nick)}</strong><br>
                <small>${String(data.message)}</small>
            </span>    
        </div>
    `
}

export { onChat }
