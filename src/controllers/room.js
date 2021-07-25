exports.index = async (req, res) => {
    try {
        return res.render('chat', { room: 'off-topic' })
    } catch(e) {
        console.log(e)
        res.render('404')
    }
}

exports.entry = async (req, res) => {
    try {
        return res.render('private')
    } catch(e) {
        console.log(e)
        return res.render('404')
    }
}

exports.share = async (req, res) => {
    try {
        return res.render('sharing')
    } catch (e) {
        console.log(e)
        return res.render('404')
    }
}
