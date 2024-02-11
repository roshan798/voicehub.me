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
        const types = ['open'];
        const rooms = await roomService.getAllRooms(types);
        const allRooms = rooms.map(room => new RoomDto(room));
        res.json({ allRooms })
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
