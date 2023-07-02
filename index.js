const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connect = require('./config/db-config');

const Group = require('./models/group');
const Chat = require('./models/chat');

app.set('view engine', 'ejs'); //setting middleware for ejs
app.use(express.json())
app.use(express.urlencoded({extended: true}))


io.on('connection', (socket) => {  // when we emit from somewhere it is taken by .on as parameter,then we do stuff
    console.log('a user connected', socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
    socket.on('join_room', (data) => { //we have .emit from index.js which is now handled by server here i.e what to do after that 
        console.log("joining a room", data.roomid);
        socket.join(data.roomid);
    });

    socket.on('new_msg', async (data) => { 
        console.log("received new message", data);
        const chat = await Chat.create({  //creating a database object in mongo
            roomid: data.roomid,
            sender: data.sender,
            content: data.message
        });
        io.to(data.roomid).emit('msg_rcvd', data); //.to is used to emit to only particular roomid else they are emitted to all i.e if not done like this it is given to server and server emit to all clients(here group) ,so now group ki baat group mein hi rahegi
    });
});

app.get('/chat/:roomid/:user', async (req, res) => {
    const group = await Group.findById(req.params.roomid); //finding groupname from roomid from database 'group'
    const chats = await Chat.find({  //finding all prev chats for this room so that when you refresh or comes again all prev chats will be there to you
        roomid: req.params.roomid
    });
    console.log(chats)
    res.render('index', {  //sending all this data to index.js so that we can use it there
        roomid: req.params.roomid, 
        user: req.params.user,
        groupname: group.name,
        previousmsgs: chats
    });
});

app.get('/group', async (req, res) => {
    res.render('group');  //it will render group.js
});

app.post('/group', async (req, res) => {
    console.log(req.body);  
    await Group.create({   // it is creating a new group in database
        name: req.body.name
    });
    res.redirect('/group');

});
  
server.listen(3001, async () => {
  console.log('listening on *:3000');
  await connect();
  console.log("DB connected");
});