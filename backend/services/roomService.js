import { ObjectId } from 'mongodb';
import roomModal from "../Models/roomModal.js";

class RoomService {
    async create(payload) {
        const { topic, roomType, ownerId } = payload;

        const roomData = {
            topic,
            roomType,
            ownerId,
            speakers: [ownerId],
        };

        // Add owner to approvedUsers for social and private rooms
        if (roomType === 'social' || roomType === 'private') {
            roomData.approvedUsers = [ownerId];
        }
        const room = await roomModal.create(roomData);
        return room;
    }
    async deleteRoom(roomId) {
        try {
            return await roomModal.deleteOne({ _id: roomId })
        }
        catch (e) {
            console.log(e)
            throw e;
        }
    }

    async addUserToRoom(roomId, userId) {
        // Retrieve the room from the database based on the roomId
        const room = await roomModal.findById(roomId);
        // If the room is found, add the userId to the speakers array
        if (room) {
            room.speakers.push(userId);
            await room.save();
        }
        return room; // Return the updated room
    }

    async removeUserFromRoom(roomId, userId) {
        try {
            const room = await roomModal.findById(roomId);
            if (room) {
                room.speakers = room.speakers.filter(speaker => {
                    return speaker && userId && speaker.toString() !== userId.toString();
                });
                await room.save();
            }
            return room;
        } catch (error) {
            console.error("Error removing user from room:", error);
            throw error;
        }
    }

    async getAllRooms(types, limit, skip) {
        const rooms = await roomModal.find({
            roomType: { $in: types }
        })
            .populate('speakers')
            .populate('ownerId')
            .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
            .limit(limit)
            .skip(skip)
            .exec();
        return rooms;
    }

    async noOfRooms(types) {
        const totalRooms = await roomModal.countDocuments({
            roomType: { $in: types }
        });
        return totalRooms;
    }
    async getRoom(roomId) {

        if (!ObjectId.isValid(roomId)) {
            throw new Error("Invalid room. The room you are looking for does not exist.");
        }
        try {
            const room = await roomModal.findOne({ _id: roomId });
            return room;
        } catch (error) {
            throw new Error("Error occurred while getting the room. Please try again later.");
        }
    }

    updateOwnerSocketId(roomId, socketId) {
        return roomModal.updateOne({ _id: roomId }, { ownerSocketId: socketId });
    }
    addUserToApprovedList(roomId, userId) {
        return roomModal.updateOne({ _id: roomId }, { $push: { approvedUsers: userId } });
    }
}


export default new RoomService();