const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const app = express();
const PORT = process.env.PORT || 5000;

const {createRoom, joinRoom, deleteRoom, getOtherPlayerSocketId} = require('./rooms');

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('New user connected: ', socket.id);

    socket.on('createRoom', (data) => {
        const {error, room, name, player} = createRoom(socket.id, data.name, data.room);
        if (error) {
            io.to(socket.id).emit('error', {error});
            return;
        }
        io.to(socket.id).emit('roomCreated', {room, name, player, id: socket.id});
    });

    socket.on('joinRoom', (data) => {
        const {error, room, name, player, otherPlayerName, otherPlayerId} = joinRoom(socket.id, data.name, data.room);
        if (error) {
            io.to(socket.id).emit('error', {error});
            return;
        }
        io.to(socket.id).emit('roomJoined', {room, name, player, id: socket.id, otherPlayerName});
        io.to(otherPlayerId).emit('otherPlayerJoined', {name});
    });

    socket.on('madeMove', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('newMove', data);
    });

    socket.on('gameOver', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('gameOver', data);
    });

    socket.on('playAgain', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('playAgain', data);
    });

    socket.on('timerType', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('timerType', data);
    });

    socket.on('drawOffered', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('drawOffered', data);
    });

    socket.on('acceptDraw', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('acceptDraw', data);
    });

    socket.on('rejectDraw', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('rejectDraw', data);
    });

    socket.on('figureSaved', (data) => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('figureSaved', data);
    })

    socket.on('disconnect', () => {
        io.to(getOtherPlayerSocketId(socket.id)).emit('otherPlayerDisconnected');
        deleteRoom(socket.id);
    });

    socket.on('connect_error', (err) => {
        console.log(`connect_error due to ${err.message}`);
        io.to(socket.id).emit('error', err.message);
    });
});

server.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`)
});