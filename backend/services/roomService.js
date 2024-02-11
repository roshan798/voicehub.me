import { ObjectId } from 'mongodb';
import roomModal from "../Models/roomModal.js";

class RoomService {
    async create(payload) {
        const { topic, roomType, ownerId } = payload;
        const room = await roomModal.create(
            {
                topic,
                roomType,
                ownerId,
                speakers: [ownerId]
            }
        );
        return room;
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
            // Retrieve the room from the database based on the roomId
            const room = await roomModal.findById(roomId);
            // If the room is found, remove the userId from the speakers array
            if (room) {
                room.speakers = room.speakers.filter(speaker => {
                    // Filter out the userId from the speakers array
                    return speaker.toString() !== userId.toString();
                });
                await room.save();
            }
            return room; // Return the updated room
        } catch (error) {
            console.error("Error removing user from room:", error);
            throw error;
        }
    }


    async getAllRooms(types) {
        const rooms = await roomModal.find({
            roomType: { $in: types }
        })
            .populate('speakers')
            .populate('ownerId')
            .exec();
        return rooms;
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
}


export default new RoomService();