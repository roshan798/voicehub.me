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
    async getAllRooms(types) {
        const rooms = await roomModal.find({
            roomType: { $in: types }
        })
            .populate('speakers')
            .populate('ownerId')
            .exec();
        return rooms;
    }
    async getRoom(roomid) {
        const room = await roomModal.findOne({ _id: roomid });
        return room;
    }
}


export default new RoomService();