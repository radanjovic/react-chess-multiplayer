let rooms = {}

const createRoom = (id, name, room) => {
    room = room.trim().toLowerCase();
    name = name.trim().toLowerCase();

    if (!name || name === '' || !room || room === '') {
        return {error: 'Room and name are required!'}
    }

    let roomExist;
    for (let [key, value] of Object.entries(rooms)) {
        if (key === room) {
            roomExist = true;
            break;
        }
    }
    if (roomExist) {
        return {error: 'Room with the same name already exists!'}
    }

    rooms[`${room}`] = {};
    rooms[`${room}`].whitePlayer = {}
    rooms[`${room}`].whitePlayer.id = id;
    rooms[`${room}`].whitePlayer.name = name;
    rooms[`${room}`].sockets = [];
    rooms[`${room}`].sockets.push(id);

    return {name, room, player: 'white'}
}

const joinRoom = (id, name, room) => {
    room = room.trim().toLowerCase();
    name = name.trim().toLowerCase();

    if (!name || name === '' || !room || room === '') {
        return {error: 'Room and name are required!'}
    }

    let roomExist;
    let sameName;
    for (let [key, value] of Object.entries(rooms)) {
        if (key === room) {
            roomExist = rooms[key];
            if (rooms[key]?.whitePlayer?.name === name) {
                sameName = true;
            }
            break;
        }
    }
    if (!roomExist) {
        return {error: 'Room with the specified name does not exist! Please enter an existing room name or create a new one!'}
    }

    if (sameName) {
        return {error: 'You selected the same name as other player in this room! Please select another one!'}
    }

    rooms[`${room}`].blackPlayer = {}
    rooms[`${room}`].blackPlayer.id = id;
    rooms[`${room}`].blackPlayer.name = name;
    rooms[`${room}`].sockets?.push(id);

    return {name, room, player: 'black', otherPlayerName: roomExist.whitePlayer?.name, otherPlayerId: roomExist?.whitePlayer?.id}
}

const getOtherPlayerSocketId = (id) => {
    for (let key in rooms) {
        if (rooms[key]?.sockets?.includes(id)) {
            return rooms[key]?.sockets?.filter(uid => uid !== id);
        }
    }
}

const deleteRoom = (id) => {
    for (let key in rooms) {
        if (rooms[key]?.sockets?.includes(id)) {
            delete rooms[key];
            return;
        }
    }
}


module.exports = {
    createRoom,
    joinRoom,
    getOtherPlayerSocketId,
    deleteRoom,
}