const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();

// middlewares
// Allow CORS from the configured FRONTEND_URL; if not provided, allow all origins
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// dependency for real time chat application
const http = require("http");
const { Server } = require("socket.io");
// code for real time chat application
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});


//import conn and coll
require("./conn.js");
const rdata = require("./coll.js");


















app.get('/', (req, res) => {
    res.send('Okay');
});

app.post('/data', async (req, res) => {

    const { name, roomId } = req.body;

    const existingroom = await rdata.findOne({ roomid: roomId });
    const existingnameroom = await rdata.findOne({ $and: [{ roomid: roomId }, { 'username': name }] });
    if (existingnameroom) {
        try {
            return res.status(200).json({ message: 'Data received and updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Server error' });
        }
     }
    else if (existingroom) {
        existingroom.username.push(name);
        try {
            await existingroom.save();
            return res.status(200).json({ message: 'Data received and updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Server error' });
        }
    }
    else {
        const newRoom = new rdata({
            roomid: roomId,
            username: [name],
        });
        try {
            await newRoom.save();
            return res.status(200).json({ message: 'Data received and saved successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Server error' });
        }
    }
});

let usersocket = {};
let usernames = {};
let mapping = {};
let roomcode = {};
let roomlanguage = {};

async function savecode(id, code) {
    try {
        const filter = { roomid: id };
        const update = { code: code };
    await rdata.findOneAndUpdate(filter, update, { upsert: true });
    } catch (error) {
        console.error(error);
    }
}

io.on('connection', (socket) => {
    // console.log(a user connected with ${socket.id});
    socket.on('Update_users', ({ id, username }) => {
        async function tempforasync() {
            socket.join(id);
            socket.username = username;


            socket.broadcast.to(id).emit('New user joined', username);

            if (usersocket[id] == undefined) {
                try {
                    const existingroom = await rdata.findOne({ roomid: id });
                    roomcode[id] = [];
                    usersocket[id] = [];
                    usernames[id] = [];
                    roomcode[id] = existingroom.code;
                }
                catch (e) { console.log(e); }
            }

            usersocket[id].push(socket.id);
            usernames[id].push(username);
            mapping[socket.id] = id;

            // if (roomcode[id]) {
            const codee = roomcode[id];
            io.to(socket.id).emit('Code for new user',  codee );
            // }

            if (roomlanguage[id]) {
                io.to(socket.id).emit('Language for new user', roomlanguage[id]);
                io.to(socket.id).emit('mode for new user',roomlanguage[id]);
            }

            io.to(id).emit('User list for frontend', usernames[id]);

        }
        tempforasync();
    });

    socket.on('Updated code for backend', ({ codetopass, line, ch }) => {
        roomcode[mapping[socket.id]] = codetopass;
        io.to(mapping[socket.id]).emit("Updated code for users", { codetopass, line, ch });
    })
    socket.on('Updated mode for backend', (lang) => {
        io.to(mapping[socket.id]).emit("Updated mode for users", lang);
    })

    socket.on('Updated langauge for backend', (value) => {
        roomlanguage[mapping[socket.id]] = value;
        io.to(mapping[socket.id]).emit("Updated language for users", roomlanguage[mapping[socket.id]]);
    })

    socket.on('disconnect', async () => {
        // console.log(user disconnected ${socket.id});
        socket.broadcast.to(mapping[socket.id]).emit('User left the room', socket.username);

        const xid = mapping[socket.id];
        const xcode = roomcode[mapping[socket.id]];

        usersocket[mapping[socket.id]] = usersocket[mapping[socket.id]].filter(item => item !== socket.id);
        usernames[mapping[socket.id]] = usernames[mapping[socket.id]].filter(item => item !== socket.username);
        io.to(mapping[socket.id]).emit('User list for frontend', usernames[mapping[socket.id]]);
        delete mapping[socket.id];
        if (Object.keys(mapping).length === 0) {
            // persist code for the room when everyone leaves
            savecode(xid, xcode);
            // cleanup using xid (the room id) rather than mapping[socket.id] which was deleted
            delete roomcode[xid];
            delete roomlanguage[xid];
            delete usersocket[xid];
            delete usernames[xid];
        }
    });
});













const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
