import UserDto from "./userDtos.js"
class RoomDto {
    id;
    topic;
    roomType;
    speakers;
    owner;
    createdAt;

    constructor(room, showRequestList = false) {
        this.id = room._id;
        this.topic = room.topic;
        this.roomType = room.roomType;
        this.speakers = room.speakers;
        this.owner = new UserDto(room.ownerId);
        this.speakers = room.speakers.map(speaker => new UserDto(speaker));
        this.createdAt = room.createdAt;
        if (showRequestList && room.roomType == "social" && room.joinRequests) {
            this.joinRequests = room.joinRequests.map(user => new UserDto(user)) || [];
        }
    }
}
export default RoomDto;