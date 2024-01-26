class UserDto {
    id;
    phone;
    activated;
    createdAt;
    constructor(user) {
        this.id = user._id;
        this.email = user.email
        this.phone = user.phone;
        this.name = user.name;
        this.avatar = user.avatar
        this.activated = user.activated;
        this.createdAt = user.createdAt;
    }
}

export default UserDto;