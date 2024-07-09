import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
import { ACTIONS } from './../actions.js';
import mongoose from 'mongoose';
import RoomService from "../services/roomService.js";
import roomService from '../services/roomService.js';

const { ObjectId } = mongoose.Types;

const initilizeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL],
            methods: ['GET', 'POST'],
        },
    });

    const SocketUserMapping = new Map(); // socketId -> user
    const UserIdSocketMapping = new Map(); // userId -> socketId

    const handleConnection = (socket) => {
        socket.on(ACTIONS.JOIN, handleJoin(socket));
        socket.on(ACTIONS.RELAY_ICE, handleRelayIce(socket));
        socket.on(ACTIONS.RELAY_SDP, handleRelaySdp(socket));
        socket.on(ACTIONS.MUTE, handleMute(socket));
        socket.on(ACTIONS.UNMUTE, handleUnmute(socket));
        socket.on(ACTIONS.JOIN_REQUEST, handleJoinRequest(socket));
        socket.on(ACTIONS.JOIN_APPROVED, handleJoinApproved(socket));
        socket.on(ACTIONS.JOIN_CANCELLED, handleJoinCancelled(socket));
        socket.on(ACTIONS.LEAVE, (data) => leaveRoom(socket, data));
        socket.on(ACTIONS.REMOVE_USER, handleRemoveUser)
        socket.on('disconnecting', (data) => leaveRoom(socket, { ...data, from: "disconnecting" }));
    };

    //  remove user from room
    const handleRemoveUser = async ({ senderId, roomId, userId }) => {
        //log 
        // console.log("REMOVE_USER", senderId, roomId, userId);
        try {
            // get the user who sent this event then check if he is the owner
            const room = await RoomService.getRoom(roomId);
            if (room.ownerId.toString() === senderId && userId !== senderId) {
                //  remove the user from the approved user list
                // then send all clients of the room to remove this user
                await RoomService.removeUserFromApprovedList(roomId, userId);
                await RoomService.removeUserFromRoom(roomId, userId);
                const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
                clients.forEach(clientId => {
                    io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                        peerId: UserIdSocketMapping.get(userId),
                        userId: userId,
                    });
                });
                // send the user that he is been removed
                const socketId = UserIdSocketMapping.get(userId);
                if (socketId) {
                    io.to(socketId).emit(ACTIONS.YOU_ARE_REMOVED, { roomId });
                }
                // remove the user from the mapping
                SocketUserMapping.delete(UserIdSocketMapping.get(userId));
                UserIdSocketMapping.delete(userId);
            }
            else {
                // if the user is not the owner then return
                // in future we will return an error specifying you are not allowed to remove user
                return;
            }

        } catch (error) {
            console.error('Error removing user:', error);
        }
    }
    const handleJoin = (socket) => async ({ roomId, user }) => {
        try {
            SocketUserMapping.set(socket.id, user);
            UserIdSocketMapping.set(user.id, socket.id);
            const room = await RoomService.getRoom(roomId);
            if (!room) {
                return socket.emit(ACTIONS.ROOM_NOT_FOUND);
            }

            const userIdObj = new ObjectId(user.id);
            if (room.roomType === 'social' &&
                room.ownerId.toString() !== user.id &&
                !room.approvedUsers.includes(userIdObj)
            ) {
                if (room?.joinRequests.includes(userIdObj)) {
                    // room join request is still pending
                    socket.emit(ACTIONS.JOIN_REQUEST_PENDING, { roomId, user });
                } else {
                    // not authorized to join this room
                    socket.emit(ACTIONS.USER_NOT_ALLOWED, { roomId, user });
                }
                return;
            }

            if (room.ownerId.toString() === user.id) {
                // this user is the owner of the room so update the owner's socket id
                await RoomService.updateOwnerSocketId(roomId, socket.id);
            }

            await RoomService.addUserToRoom(roomId, user.id);
            // get all clients in the room
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

            // notify all clients in the room that a new peer has joined
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.ADD_PEER, {
                    peerId: socket.id,
                    createOffer: false,
                    user: user
                });

                socket.emit(ACTIONS.ADD_PEER, {
                    peerId: clientId,
                    createOffer: true,
                    user: SocketUserMapping.get(clientId)
                });
            });
            // join the room
            socket.join(roomId);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Error joining room' });
        }
    };

    const handleRelayIce = (socket) => ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate
        });
    };

    const handleRelaySdp = (socket) => ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription
        });
    };

    const handleMute = (socket) => ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId
            });
        });
    };

    const handleUnmute = (socket) => ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach(clientId => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId
            });
        });
    };

    const handleJoinRequest = (socket) => async ({ roomId, user }) => {
        try {
            const room = await RoomService.getRoom(roomId);
            if (!room) {
                return socket.emit(ACTIONS.ROOM_NOT_FOUND);
            }
            if (user?.id) {
                await RoomService.addUserToRequestsList(roomId, user.id);
            }
            const ownerSocketId = room.ownerSocketId?.toString();

            if (ownerSocketId) {
                // send the join request to the owner of the room
                io.to(ownerSocketId).emit(ACTIONS.APPROVE_JOIN_REQUEST,
                    {
                        roomId,
                        user,
                        socketId: socket.id
                    }
                );
            } else {
                socket.emit(ACTIONS.OWNER_NOT_FOUND);
            }
        } catch (error) {
            console.error('Error handling join request:', error);
            socket.emit('error', { message: 'Error handling join request' });
        }
    };


    const handleJoinApproved = (socket) => async ({ userId, roomId }) => {

        try {
            await Promise.all([
                RoomService.addUserToApprovedList(roomId, userId),
                roomService.removeUserFromRequestsList(roomId, userId)
            ]);

            // const userSocketId = Array.from(SocketUserMapping.entries()).find(([key, value]) => value.id === userId)?.[0];
            const userSocketId = UserIdSocketMapping.get(userId)
            // console.log("userId->socketId", userId, "->", userSocketId);
            if (userSocketId) {
                return io.to(userSocketId).emit(ACTIONS.JOIN_APPROVED, { roomId });
            }

            socket.emit(ACTIONS.OWNER_NOT_FOUND, { roomId, userId });
        } catch (error) {
            console.error('Error approving join request:', error);
            socket.emit('error', { message: 'Error approving join request' });
        }
    };

    const handleJoinCancelled = (socket) => async ({ userId, roomId }) => {
        // console.log("JOIN_CANCELLED", roomId, userId);
        try {
            await RoomService.removeUserFromRequestsList(roomId, userId);
            // const userSocketId = Array.from(SocketUserMapping.entries()).find(([key, value]) => value.id === userId)?.[0];
            const userSocketId = UserIdSocketMapping.get(userId)
            // console.log("userSocketId", userSocketId);
            if (userSocketId) {
                return io.to(userSocketId).emit(ACTIONS.JOIN_CANCELLED, { roomId });
            }

            socket.emit(ACTIONS.OWNER_NOT_FOUND, { roomId, userId });
        } catch (error) {
            console.error('Error cancelling join request:', error);
            socket.emit('error', { message: 'Error cancelling join request' });
        }
    };

    const leaveRoom = async (socket, { roomId, userId, from = "leave" }) => {
        try {
            const { rooms } = socket;
            if (from === "leave") {
                const room = await RoomService.getRoom(roomId);
                if (room.ownerId.toString() === userId) {
                    await RoomService.updateOwnerSocketId(roomId, null);
                }
            }
            Array.from(rooms).forEach(roomId => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

                clients.forEach(clientId => {
                    io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                        peerId: socket.id,
                        userId: SocketUserMapping.get(socket.id)?.id,
                    });

                    socket.emit(ACTIONS.REMOVE_PEER, {
                        peerId: clientId,
                        userId: SocketUserMapping.get(socket.id)?.id,
                    });
                });
                // console.log("leaving room: roomId", roomId, "userId", userId, "socket.id", socket.id);
                socket.leave(roomId);
            });

            if (roomId && userId) {
                await RoomService.removeUserFromRoom(roomId, userId);
            }
            // user id is null then find the id from the map
            if (userId) {
                UserIdSocketMapping.delete(userId);
            }
            else {
                // console.log("else in leave room func");
                // SocketUserMapping.get(socket.id)?.id
                const user = SocketUserMapping.get(socket.id)
                // console.log("user->socketId", user, "->", socket.id);
                if (user) {
                    // console.log("removed userId->socketId", user.id, "->", socket.id);
                    UserIdSocketMapping.delete(user.id);

                }
            }
            // console.log("removed socketId->user", socket.id, "->", SocketUserMapping.get(socket.id));
            SocketUserMapping.delete(socket.id);
        } catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('error', { message: 'Error leaving room' });
        }
    };

    io.on('connection', handleConnection);
};

export default initilizeSocket;