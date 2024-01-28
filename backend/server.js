import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import router from './routes.js';
import cookieParser from 'cookie-parser';
import connectDB from './database.js';
import { Server } from 'socket.io';
import { ACTIONS } from './actions.js';
import http from 'http';

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// for socket
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL],
        methods: ['GET', 'POST'],
    },

});

//
connectDB();
app.use(cookieParser());
const corsOptions = {
    origin: [process.env.FRONTEND_URL],
    credentials: true,
};
app.use(cors(corsOptions));
app.use('/storage', express.static('storage'));
app.use(express.json({ limit: '4mb' }));

// Sockets
const socketUserMapping = {}
io.on('connection', (socket) => {

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMapping[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {

            io.to(clientId).emit(ACTIONS.ADD_PEER,
                {
                    peerId: socket.id,
                    createOffer: false,
                    user: user
                });
            socket.emit(ACTIONS.ADD_PEER,
                {
                    peerId: clientId,
                    createOffer: true,
                    user: socketUserMapping[clientId]
                });

        });
        socket.join(roomId);

        // handle relay ice
        socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
            io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
                peerId: socket.id,
                icecandidate
            });
        });

        // handle relay sdp(session description)
        socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
            io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
                peerId: socket.id,
                sessionDescription
            });
        });

        socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            clients.forEach(clientId => {
                io.to(clientId).emit(ACTIONS.MUTE, {
                    peerId: socket.id,
                    userId
                });
            })
        });

        socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            clients.forEach(clientId => {
                io.to(clientId).emit(ACTIONS.UNMUTE, {
                    peerId: socket.id,
                    userId
                });
            })
        })

        // handle remove peer
        const leaveRoom = ({ roomId }) => {
            const { rooms } = socket;
            Array.from(rooms).forEach(roomId => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomId));

                clients.forEach(clientId => {
                    io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                        peerId: socket.id,
                        userId: socketUserMapping[socket.id]?.id,
                    })
                    socket.emit(ACTIONS.REMOVE_PEER, {
                        peerId: clientId,
                        userId: socketUserMapping[clientId]?.id,
                    });
                })
                socket.leave(roomId)
            });

            delete socketUserMapping[socket.id];
        };
        socket.on(ACTIONS.LEAVE, leaveRoom);
        socket.on('disconnecting', leaveRoom);
    });
});

app.use(router);
router.get('/', (req, res) => {
    res.json({
        msg: 'Welcome to coders house',
    });
});

server.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});
