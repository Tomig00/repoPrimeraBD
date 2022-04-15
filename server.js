const {options} = require('./public/options/mariaDB')
const knex = require('knex')(options)
const sendProd = require('./helper')
const Contenedor = require('./api')
const Mensajes = require('./apiMensajes')
const { response } = require('express')
const express = require('express')
const handlebars = require('express-handlebars')
const { Server: IOServer } = require('socket.io')
const { Server: HttpServer } = require('http')



let test = new Contenedor(knex,"prueba")
let msgManager = new Mensajes(knex, "mensajes")

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.json())
app.use(express.urlencoded({extended: true}))

let messages = []
let prod = []



app.use(express.static('./public'))
app.get('/', (req, res) => {
  res.sendFile('index.html')
})

/* Server Listen */
const PORT = process.env.PORT || 8080
const server = httpServer.listen(PORT , () => console.log(`servidor Levantado ${PORT}`))
server.on('error', (error) => console.log(`Error en servidor ${error}`))


io.on('connection', async (socket) => {
  console.log('se conecto un usuario')
  
  async function getMsgOnConnection()
    {
      let mensajes = []
      mensajes = await msgManager.getMessages()
      return mensajes
    }

    
    messages = await getMsgOnConnection()
  
  socket.emit('mensajes', messages)
  sendProd(socket)
  
  socket.on('new-message',async (data) => {
    async function agregarMsg(data)
    {
      let agregado = []
      agregado = await msgManager.addMessage(data)
      return agregado
    }
    await agregarMsg(data)
    async function get()
    {
      let mensajes = []
      mensajes = await msgManager.getMessages()
      return mensajes
    }

    
    messages = await get()


    
    
    io.sockets.emit('messages', messages);
  })

  socket.on('new-prod', async (data) => {
    
    async function agregar(data)
    {
      let agregado = []
      agregado = test.addProd(data)
      return agregado
    }
    
    await agregar(data)

    async function prodF()
    {
      let preProd = []
      console.log("Antes del await")
      preProd = await test.getAll()
      return preProd
    }

    prod = await prodF()
    io.sockets.emit('prod', prod);
  })


})