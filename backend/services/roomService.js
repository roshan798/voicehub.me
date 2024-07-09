import { ObjectId } from 'mongodb';
import roomModal from "../Models/roomModal.js";

class RoomService {
    /**
     * Create a new room
     * @param {Object} payload - The room data
     * @param {string} payload.topic - The topic of the room
     * @param {string} payload.roomType - The type of the room (open, social, private)
     * @param {ObjectId} payload.ownerId - The ID of the room owner
     * @returns {Object} - The created room
     */
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
        try {
            const room = await roomModal.create(roomData);
            return room;
        } catch (error) {
            console.error("Error creating room:", error);
            throw new Error("An error occurred while creating the room. Please try again later.");
        }
    }

    /**
     * Delete a room by ID
     * @param {ObjectId} roomId - The ID of the room to delete
     * @returns {Object} - The result of the deletion
     */
    async deleteRoom(roomId) {
        try {
            return await roomModal.deleteOne({ _id: roomId });
        } catch (e) {
            console.error("Error deleting room:", e);
            throw new Error("An error occurred while deleting the room. Please try again later.");
        }
    }

    /**
     * Add a user to the speakers list of a room
     * @param {ObjectId} roomId - The ID of the room
     * @param {ObjectId} userId - The ID of the user to add
     * @returns {Object} - The updated room
     */
    async addUserToRoom(roomId, userId) {
        try {
            const room = await roomModal.findById(roomId);
            if (room) {
                room.speakers.push(userId);
                await room.save();
            }
            return room; // Return the updated room
        } catch (error) {
            console.error("Error adding user to room:", error);
            throw new Error("An error occurred while adding the user to the room. Please try again later.");
        }
    }

    /**
     * Remove a user from the speakers list of a room
     * @param {ObjectId} roomId - The ID of the room
     * @param {ObjectId} userId - The ID of the user to remove
     * @returns {Object} - The updated room
     */
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
            throw new Error("An error occurred while removing the user from the room. Please try again later.");
        }
    }
    //change needed
    async removeUserFromApprovedList(roomId, userId) {
        try {
            const room = await roomModal.findById(roomId);
            if (room) {
                room.approvedUsers = room.approvedUsers.filter(user => {
                    return user && userId && user.toString() !== userId.toString();
                });
                await room.save();
            }
            return room;

        } catch (error) {
            console.error("Error removing user from approved list:", error);
            throw new Error("An error occurred while removing the user from the approved list. Please try again later.");
        }
    }


    /**
     * Get all rooms with specified types, with pagination
     * @param {Array<string>} types - The types of rooms to retrieve
     * @param {number} limit - The number of rooms to return
     * @param {number} skip - The number of rooms to skip
     * @returns {Array<Object>} - The list of rooms
     */
    async getAllRooms(types, limit, skip) {
        try {
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
        } catch (error) {
            console.error("Error getting all rooms:", error);
            throw new Error("An error occurred while retrieving the rooms. Please try again later.");
        }
    }

    /**
     * Get the total number of rooms with specified types
     * @param {Array<string>} types - The types of rooms to count
     * @returns {number} - The total number of rooms
     */
    async noOfRooms(types) {
        try {
            const totalRooms = await roomModal.countDocuments({
                roomType: { $in: types }
            });
            return totalRooms;
        } catch (error) {
            console.error("Error getting number of rooms:", error);
            throw new Error("An error occurred while counting the rooms. Please try again later.");
        }
    }

    /**
     * Get a room by ID with conditional population of joinRequests
     * @param {ObjectId} roomId - The ID of the room to retrieve
     * @param {ObjectId} userId - The ID of the user requesting the room
     * @returns {Object} - The retrieved room
     */
    async getRoom(roomId, userId) {
        if (!ObjectId.isValid(roomId)) {
            throw new Error("Invalid room. The room you are looking for does not exist.");
        }

        try {
            const query = roomModal.findOne({ _id: roomId })
            const room = await query.exec();
            // Check if the userId matches the ownerId
            if (userId && userId === room.ownerId.toString()) {
                await room.populate('joinRequests')
            }

            return room;
        } catch (error) {
            console.error("Error getting room:", error);
            throw new Error("Error occurred while getting the room. Please try again later.");
        }
    }


    /**
     * Search for rooms based on query
     * @param {Object} query - The search query
     * @param {string} [query.topic=""] - The topic to search for
     * @param {string} [query.roomType="open"] - The type of rooms to search for
     * @param {number} [query.page=1] - The page number for pagination
     * @param {number} [query.resultPerPage=8] - The number of results per page
     * @returns {Array<Object>} - The list of rooms that match the query
     */
    async searchRooms(query) {
        const { topic = "", roomType = "open", page = 1, resultPerPage = 8 } = query;
        try {
            const searchConditions = {
                $and: [
                    { roomType: roomType },
                    { topic: { $regex: topic, $options: "i" } },
                ]
            };

            const rooms = await roomModal.find(searchConditions)
                .populate('speakers')
                .populate('ownerId')
                .sort({ createdAt: -1 })
                .exec();

            return rooms;
        } catch (error) {
            console.error("Error occurred while searching for rooms:", error);
            throw new Error("An error occurred while searching for rooms. Please try again later.");
        }
    }

    /**
     * Update the owner's socket ID of a room
     * @param {ObjectId} roomId - The ID of the room
     * @param {string} socketId - The new socket ID of the owner
     * @returns {Object} - The result of the update
     */
    async updateOwnerSocketId(roomId, socketId) {
        try {
            return await roomModal.updateOne({ _id: roomId }, { ownerSocketId: socketId });
        } catch (error) {
            console.error("Error updating owner socket ID:", error);
            throw new Error("An error occurred while updating the owner socket ID. Please try again later.");
        }
    }

    /**
     * Add a user to the approved users list of a room
     * @param {ObjectId} roomId - The ID of the room
     * @param {ObjectId} userId - The ID of the user to add
     * @returns {Object} - The result of the update
     */
    async addUserToApprovedList(roomId, userId) {
        try {
            return await roomModal.updateOne({ _id: roomId }, { $push: { approvedUsers: userId } });
        } catch (error) {
            console.error("Error adding user to approved list:", error);
            throw new Error("An error occurred while adding the user to the approved list. Please try again later.");
        }
    }

    /**
     * Remove a user from the join requests list of a room
     * @param {ObjectId} roomId - The ID of the room
     * @param {ObjectId} userId - The ID of the user to remove
     * @returns {Object} - The result of the update
     */
    async removeUserFromRequestsList(roomId, userId) {
        try {
            return await roomModal.updateOne(
                { _id: roomId },
                { $pull: { joinRequests: userId } }
            );
        } catch (error) {
            console.error("Error removing user from requests list:", error);
            throw new Error("An error occurred while removing the user from the requests list. Please try again later.");
        }
    }

    /**
     * Add a user to the join requests list of a room
     * @param {ObjectId} roomId - The ID of the room
     * @param {ObjectId} userId - The ID of the user to add
     * @returns {Object} - The result of the update
     */
    async addUserToRequestsList(roomId, userId) {
        try {
            return await roomModal.updateOne({ _id: roomId }, { $push: { joinRequests: userId } });
        } catch (error) {
            console.error("Error adding user to requests list:", error);
            throw new Error("An error occurred while adding the user to the requests list. Please try again later.");
        }
    }

    /**
     * Get all join requests for a room
     * @param {ObjectId} roomId - The ID of the room
     * @returns {Object} - The room with join requests
     */
    async getAllRequests(roomId) {
        try {
            return await roomModal.findOne({ _id: roomId })
                .populate('joinRequests');
        } catch (error) {
            console.error("Error getting all join requests:", error);
            throw new Error("An error occurred while getting the join requests. Please try again later.");
        }
    }
}

export default new RoomService();
