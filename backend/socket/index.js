import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
import { ACTIONS } from './../actions.js';
import mongoose from 'mongoose';
import RoomService from "../services/roomService.js";
const { ObjectId } = mongoose.Types;


const initilizeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL],
            methods: ['GET', 'POST'],
        },
    });
    const socketUserMapping = new Map();
    // Handle socket connections
    io.on('connection', (socket) => {
        // Handle joining a room
        socket.on(ACTIONS.JOIN, async ({ roomId, user }) => {
            try {
                socketUserMapping.set(socket.id, user);
                const room = await RoomService.getRoom(roomId);
                if (!room) {
                    return socket.emit(ACTIONS.ROOM_NOT_FOUND);
                }
                // first implement this on frontend
                const userIdObj = new ObjectId(user.id);
                if (room.roomType === 'social' && !room.approvedUsers.includes(userIdObj)) {
                    // If user is not approved, send join request to the owner
                    socket.emit(ACTIONS.USER_NOT_ALLOWED, {
                        roomId,
                        user
                    });
                    return;
                }

                // the current user is the owner of the room then add it's socket id to db
                if (room.ownerId.toString() === user.id) {
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
                if (roomId && userId) {
                    await RoomService.removeUserFromRoom(roomId, userId);
                }
                socketUserMapping.delete(socket.id);
            } catch (error) {
                console.error('Error leaving room:', error);
                socket.emit('error', { message: 'Error leaving room' });
            }
        };

        socket.on(ACTIONS.JOIN_REQUEST, async ({ roomId, user }) => {
            try {
                const room = await RoomService.getRoom(roomId);
                if (!room) {
                    return socket.emit(ACTIONS.ROOM_NOT_FOUND);
                }

                const findOwnerSocketId = () => {
                    return room.ownerSocketId.toString();
                }

                const ownerSocketId = findOwnerSocketId();
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
        socket.on('disconnecting', (data) => leaveRoom({ ...data, from: "disconnecting" }));
    });
}


export default initilizeSocket;