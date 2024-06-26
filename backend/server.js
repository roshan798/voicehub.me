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
import RoomService from './services/roomService.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL],
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
connectDB().catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit process if DB connection fails
});

// Use cookie parser middleware
app.use(cookieParser());

// Set up CORS options
const corsOptions = {
    origin: [process.env.FRONTEND_URL],
    credentials: true,
};
app.use(cors(corsOptions));

// Serve static files from the 'storage' directory
app.use('/storage', express.static('storage'));

// Parse JSON payloads with a limit of 4MB
app.use(express.json({ limit: '4mb' }));

// Map to keep track of connected users
const socketUserMapping = new Map();

// Handle socket connections
io.on('connection', (socket) => {

    // Handle joining a room
    socket.on(ACTIONS.JOIN, async ({ roomId, user }) => {
        // console.log("ACTION.JOIN");
        try {
            socketUserMapping.set(socket.id, user);
            const room = await RoomService.getRoom(roomId);
            if (!room) {
                return socket.emit(ACTIONS.ROOM_NOT_FOUND);
            }
            // console.log(room, user);
            // first implement this on frontend
            const userIdObj = new ObjectId(user.id);
            if (room.roomType === 'social' && !room.approvedUsers.includes(userIdObj)) {
                // If user is not approved, send join request to the owner
                // console.log("user is not in the approved list ");
                socket.emit(ACTIONS.USER_NOT_ALLOWED, {
                    roomId,
                    user
                });
                return;
            }

            // the current user is the owner of the room then add it's socket id to db
            if (room.ownerId.toString() === user.id) {
                // console.log("owner of the room stored socket");
                await RoomService.updateOwnerSocketId(roomId, socket.id);
            }

            await RoomService.addUserToRoom(roomId, user.id);

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

            // Notify existing clients in the room about the new peer
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.ADD_PEER, {
                    peerId: socket.id,
                    createOffer: false,
                    user: user
                });

                // Notify the new peer about the existing clients
                socket.emit(ACTIONS.ADD_PEER, {
                    peerId: clientId,
                    createOffer: true,
                    user: socketUserMapping.get(clientId)
                });
            });

            // Join the room
            socket.join(roomId);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Error joining room' });
        }
    });

    // Handle relay ICE candidate
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate
        });
    });

    // Handle relay SDP (session description)
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription
        });
    });

    // Handle mute action
    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId
            });
        });
    });

    // Handle unmute action
    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId
            });
        });
    });

    // Handle removing a peer when they leave the room
    const leaveRoom = async ({ roomId, userId, from = "leave" }) => {
        try {
            const { rooms } = socket;
            // if the user is the Owner then delete the socket id of the owner
            if (from == "leave") {
                const room = await RoomService.getRoom(roomId);
                if (room.ownerId.toString() === userId) {
                    // console.log("owner of the room deleted socket");
                    await RoomService.updateOwnerSocketId(roomId, null);
                }
            }
            Array.from(rooms).forEach(roomId => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

                // Notify all clients in the room about the peer leaving
                clients.forEach(clientId => {
                    io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                        peerId: socket.id,
                        userId: socketUserMapping.get(socket.id)?.id,
                    });

                    socket.emit(ACTIONS.REMOVE_PEER, {
                        peerId: clientId,
                        userId: socketUserMapping.get(socket.id)?.id,
                    });
                });

                // Leave the room
                socket.leave(roomId);
            });

            // Remove user from room and delete from the mapping
            await RoomService.removeUserFromRoom(roomId, socketUserMapping.get(socket.id)?.id);
            socketUserMapping.delete(socket.id);
        } catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('error', { message: 'Error leaving room' });
        }
    };

    socket.on(ACTIONS.JOIN_REQUEST, async ({ roomId, user }) => {
        // console.log("got a room join req");
        try {
            const room = await RoomService.getRoom(roomId);
            if (!room) {
                return socket.emit(ACTIONS.ROOM_NOT_FOUND);
            }

            const findOwnerSocketId = () => {
                return room.ownerSocketId.toString();
            }

            const ownerSocketId = findOwnerSocketId();
            // console.log("ownerSocketId: " + ownerSocketId);
            if (ownerSocketId) {
                io.to(ownerSocketId).emit(ACTIONS.APPROVE_JOIN_REQUEST, { roomId, user });
            } else {
                socket.emit(ACTIONS.OWNER_NOT_FOUND);
            }
        } catch (error) {
            console.error('Error handling join request:', error);
            socket.emit('error', { message: 'Error handling join request' });
        }
    });

    socket.on(ACTIONS.APPROVE_JOIN_REQUEST, async ({ roomId, userId }) => {
        // console.log("211 server.js");
        try {
            await RoomService.addUserToApprovedList(roomId, userId);
            const userSocketId = Array.from(socketUserMapping.entries()).find(([key, value]) => value.id === userId)?.[0];
            if (userSocketId) {
                return io.to(userSocketId).emit(ACTIONS.JOIN_APPROVED, { roomId });
            }
            // 
            socket.emit(ACTIONS.OWNER_NOT_FOUND, { roomId, userId })
        } catch (error) {
            console.error('Error approving join request:', error);
            socket.emit('error', { message: 'Error approving join request' });
        }
    });

    socket.on(ACTIONS.JOIN_APPROVED, async ({ userId, roomId }) => {
        // add into the approved list of the room ino the db
        // console.log("JOIN APPROVED CALLED 230");
        try {
            await RoomService.addUserToApprovedList(roomId, userId);
            const userSocketId = Array.from(socketUserMapping.entries()).find(([key, value]) => value.id === userId)?.[0];
            // console.log("235 userSocketId ", userSocketId);
            if (userSocketId) {
                return io.to(userSocketId).emit(ACTIONS.JOIN_APPROVED, { roomId });
            }
            // 
            socket.emit(ACTIONS.OWNER_NOT_FOUND, { roomId, userId })
        } catch (error) {
            console.error('Error approving join request:', error);
            socket.emit('error', { message: 'Error approving join request' });
        }
    })
    socket.on(ACTIONS.JOIN_CANCELLED, async ({ userId, roomId }) => {
        // add into the approved list of the room ino the db
        try {
            // await RoomService.addUserToApprovedList(roomId, userId);
            const userSocketId = Array.from(socketUserMapping.entries()).find(([key, value]) => value.id === userId)?.[0];
            if (userSocketId) {
                return io.to(userSocketId).emit(ACTIONS.JOIN_CANCELLED, { roomId });
            }
            // 
            socket.emit(ACTIONS.OWNER_NOT_FOUND, { roomId, userId })
        } catch (error) {
            console.error('Error approving join request:', error);
            socket.emit('error', { message: 'Error approving join request' });
        }
    })
    // Handle leave and disconnect events
    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', (data)=>leaveRoom({...data,from:"disconnecting"}));
});

// Set up API routes
app.use("/api/v1", router);

router.get('/', (req, res) => {
    res.json({
        msg: 'Welcome to coders house',
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Handle global errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1); // Exit process on unhandled exception
});

// Start the server
server.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});
