//import css
import './assets/css/master.css'
//import js
import { ioServer, ioPrivateServer, ioSearch } from './assets/modules/io'

const main = document.querySelector('main')

if(main.classList.contains('chat')) ioServer()
if(main.classList.contains('sharing')) ioSearch()
if(main.classList.contains('private') && !main.classList.contains('chat')) ioPrivateServer()
