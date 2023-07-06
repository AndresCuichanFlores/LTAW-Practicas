const socket = require('socket.io');
const http = require('http');
const express = require('express');

const users = new Map();
const PUERTO = 9000;
const app = express();
const server = http.Server(app);
const io = socket(server);

app.get('/', (req, res) => {
    res.send('Bienvenido a mi aplicación Web!!!');
});

app.use('/', express.static(__dirname + '/'));

app.use(express.static('public'));

io.on('connect', (socket) => {
    console.log("A client connected")
    socket.on('identifier', identifier => {
        users.set(socket.id, identifier);
        console.log(users)
        socket.broadcast.emit("message", identifier + " se ha unido al chat.")
        socket.emit('identifierCode', socket.id)
        socket.emit('welcome', "Bienvenido al chat " + identifier + "!")
        io.emit("onlineCounter", users.size)
        var usersString = "";
        users.forEach((value, key) => {
            usersString = usersString + key + ":" + value + ";"
        });
        io.emit("connectedUsers", usersString)
    })

    socket.on('command', command => {
        if (command === "/help") {
            socket.emit("command", "Los comandos disponibles son:<br>1) /help: Lista los comandos posibles<br>2) /list: Numero de usuarios conectados<br>3) /hello: Saluda al servidor<br>4) /date: La fecha actual")
        } else if (command === "/list") {
            socket.emit("command", "El número de usuarios conectados es " + users.size)
        } else if (command === "/hello") {
            console.log(users, socket.id)
            socket.emit("message", "Hola " + users.get(socket.id) + "!")
        } else if (command === "/date") {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const day = today.getDate()
            socket.emit("command", "La fecha de hoy es " + `${day}-${month}-${year}`)
        }
    })

    socket.on('chatMessage', msg => {
        socket.broadcast.emit('chatMessage', "[" + users.get(socket.id) + "]" + msg)
    })

    socket.on('disconnect', () => {
        users.delete(socket.id)
        console.log('A client closed the connection.');
        io.emit("onlineCounter", users.size)
    });

});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);