import RoomDto from "../dtos/roomDtos.js";
import roomService from "../services/roomService.js"
class RoomsController {
    async create(req, res) {
        const { topic, roomType } = req.body;
        if (!topic || !roomType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate roomType
        const validRoomTypes = ['open', 'social', 'private'];
        if (!validRoomTypes.includes(roomType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room type. Valid types are 'open', 'social', 'private'."
            });
        }

        // Create the room
        try {
            const room = await roomService.create({
                topic,
                roomType,
                ownerId: req.user._id,
            });

            return res.status(201).json(new RoomDto(room));
        } catch (error) {
            return res.status(500).json({
                message: "Error creating room",
                error: error.message
            });
        }
    }


    async index(req, res) {
        const resultsPerPage = parseInt(req.query.resultsPerPage) || 6; // Default to 10 results per page if not specified
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        const { roomType } = req.query;

        const limit = resultsPerPage;
        const skip = (page - 1) * resultsPerPage;

        const types = roomType ? roomType.split(".") : ['open'];
        const rooms = await roomService.getAllRooms(types, limit, skip);
        const allRooms = rooms.map(room => new RoomDto(room));

        // Optionally, you might want to include total count of rooms for pagination info
        const totalRooms = await roomService.noOfRooms(types);
        res.json({
            allRooms,
            currentPage: page,
            totalPages: Math.ceil(totalRooms / resultsPerPage),
            totalRooms
        });
    }

    async search(req, res) {
        const query = req.query; // { roomType, topic }
        try {
            const rooms = await roomService.searchRooms(query);
            const searchResults = rooms.map((room) => new RoomDto(room))
            res.json({
                success: true,
                rooms: searchResults
            })
        } catch (error) {
            res.status(500).json({
                message: "Error searching rooms",
                error: error.message,
            });
        }
    }

    async show(req, res) {
        const roomId = req.params.roomId;
        const userId = req.user._id;
        try {
            const room = await roomService.getRoom(roomId, userId);
            if (userId === room.ownerId.toString()) {
                return res.json(new RoomDto(room, true));
            }
            return res.json(new RoomDto(room, false));
        } catch (error) {
            return res.json({
                error: error.message
            });
        }
    }
    async deleteRoom(req, res) {
        const roomId = req.params.roomId;
        const user = req.user;
        try {
            // check if the user is the owner then only delete the room
            const room = await roomService.getRoom(roomId);
            if (room.ownerId.toString() !== user._id) {
                return res.status(401).json({
                    message: "You are not authorized to delete this room"
                });
            }
            await roomService.deleteRoom(roomId);
            return res.json({
                success: true,
                message: "Room deleted successfully"
            });
        } catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    }
    async removeUserFromRoom(req, res) {
        const { roomId, userId } = req.params;
        try {
            const room = await roomService.getRoom(roomId);
            if (room.ownerId.toString() !== req.user._id) {
                return res.status(401).json({
                    message: "You are not authorized to remove a user from this room"
                });
            }
            await roomService.removeUserFromApprovedList(roomId, userId);
            return res.json({
                success: true,
                message: "User removed from room successfully"
            });
        } catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    }

}
export default new RoomsController();
