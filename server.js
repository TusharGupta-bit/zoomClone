const express = require("express");
const path = require("path");
const app = express();
const server = require('http').Server(app);
const io =  require("socket.io")(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const port = 8000;

//EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static')); //For Getting Static Files

//EJS SPECIFIC STUFF
app.set('view engine', 'ejs'); //Set the template Engine as EJS
app.set('views', path.join(__dirname, 'views')); // Set the Views Directory

//
app.use('/peerjs', peerServer);

//UUID SPECIFIC STUFF
app.get('/', (req, res)=>{          //For unique Id for different grps
    res.redirect(`/${uuidv4()}`);
})


app.get('/:room', (req, res)=>{
    res.render('room.ejs', { roomId: req.params.room });
})

io.on('connection', (socket) => {
    socket.on('user-joined', (roomId, userId)=>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
        socket.on('message', (message) =>{
            io.to(roomId).emit('createMessage', message)
                })
    })
  });






//Start The Server
server.listen(process.env.PORT || port,()=>{
    console.log(`The Application started Successfully on ${port}`);
});