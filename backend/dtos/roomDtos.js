import UserDto from "./userDtos.js"
class RoomDto {
    id;
    topic;
    roomType;
    speakers;
    owner;
    createdAt;

    constructor(room) {
        this.id = room._id;
        this.topic = room.topic;
        this.roomType = room.roomType;
        this.speakers = room.speakers;
        this.owner = new UserDto(room.ownerId);
        this.speakers = room.speakers.map((speaker) => new UserDto(speaker));
        // this.createdAt = room.createdAt;
    }
}
export default RoomDto;