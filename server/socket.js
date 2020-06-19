const { io } = require("./index")

function createRoom() {
  const room = Math.floor(Math.random() * 1000).toString()

  if (doesRoomExist(room)) {
    if (isRoomEmpty(room)) {
      return room
    } else {
      return createRoom()
    }
  } else {
    return room
  }
}

function doesRoomExist(room) {
  return io.sockets.adapter.rooms[room] ? true : false
}

function isRoomEmpty(room) {
  return io.sockets.adapter.rooms[room].length === 0 ? true : false
}

const socketListener = io.on("connect", socket => {
  socket.on("message", message => {
    console.log(message)
  })

  socket.on("create room", data => {
    const roomId = createRoom()
    socket.join(roomId)

    io.to(socket.id).emit("created room", roomId)
  })

  socket.on("join request", data => {
    console.log(io.sockets.adapter.rooms[data])

    if (
      !io.sockets.adapter.rooms[data] ||
      io.sockets.adapter.rooms[data].length > 1
    ) {
      io.to(socket.id).emit("failed join room", data)
    } else {
      socket.join(data)
      io.to(socket.id).emit("joined room", data)
      socket.broadcast.to(data).emit("player 2 joined room", data)
    }
  })

  socket.on('isReady', ({room, player, isReady})=>{
    socket.broadcast.to(room.id).emit('isReady', {name: player.name, isReady})
  })

  socket.on('getReadyStatus', (room)=>{
    socket.broadcast.to(room.id).emit('getReadyStatus', room)
  })

  socket.on('sendReadyStatus', ({room, whoIsReady})=>{
    console.log(whoIsReady)
    socket.broadcast.to(room.id).emit('sendReadyStatus', whoIsReady)
  })




  

  socket.on("multiplayerMatch", ({matches, room}) => {
    if (matches && room.id){
    socket.broadcast.to(room.id).emit("multiplayerMatch", matches)
    }
  })

  socket.on('finish', ({player, room})=>{
    const name = player.name
    socket.broadcast.to(room.id).emit('finish', name)
  })

  socket.on("leave lobby", room=>{

    socket.leave(room.id)
    socket.broadcast.to(room.id).emit('player disconnect')
  })

  socket.on('disconnecting', ()=>{
    const room = Object.keys(socket.rooms)[0]

    if (room){
      socket.broadcast.to(room).emit('player disconnect')
    }
  })
})

module.exports = socketListener
