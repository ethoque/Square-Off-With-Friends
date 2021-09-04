import io from 'socket.io-client'

const URL = 'localhost:3000/' 

const socket = io(URL)

var mySocketId


socket.on("createNewGame", statusUpdate => {
    mySocketId = statusUpdate.mySocketId
})

export {
    socket,
    mySocketId
}