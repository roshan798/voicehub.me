import UserDto from "./userDtos.js"
class RoomDto {
    id;
    topic;
    roomType;
    speakers;
    ownerId;
    createdAt;

    constructor(room) {
        this.id = room._id;
        this.topic = room.topic;
        this.roomType = room.roomType;
        this.speakers = room.speakers;
        this.ownerId = new UserDto(room.ownerId);
        this.createdAt = room.createdAt;
        this.speakers = room.speakers.map((speaker) => new UserDto(speaker));
    }
}
export default RoomDto;