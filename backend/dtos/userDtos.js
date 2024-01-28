class UserDto {
    id;
    phone;
    activated;
    createdAt;
    constructor(user) {
        this.id = user._id;
        this.email = user.email
        this.name = user.name;
        if (user.phone) this.phone = user.phone;
        if (user.avatar) this.avatar = user.avatar
        this.activated = user.activated;
        this.createdAt = user.createdAt;
    }
}

export default UserDto;