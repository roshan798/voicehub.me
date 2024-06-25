import RoomDto from "../dtos/roomDtos.js";
import roomService from "../services/roomService.js"
class RoomsController {
    async create(req, res) {
        const { topic, roomType } = req.body;
        if (!topic || !roomType) {

            return res.status(401).json({
                message: "All fields are required"
            });
        }
        const room = await roomService.create({
            topic,
            roomType,
            ownerId: req.user._id,
        });
        return res.json(new RoomDto(room));
    }

    async index(req, res) {
        const resultsPerPage = parseInt(req.query.resultsPerPage) || 6; // Default to 10 results per page if not specified
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified

        const limit = resultsPerPage;
        const skip = (page - 1) * resultsPerPage;

        const types = ['open'];
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


    async show(req, res) {
        const roomId = req.params.roomId;
        try {
            const room = await roomService.getRoom(roomId);
            return res.json(new RoomDto(room));
        } catch (error) {
            return res.json({
                error: error.message
            });
        }
    }
}
export default new RoomsController();
