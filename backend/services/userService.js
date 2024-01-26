import UserModel from "../Models/UserModel.js";

class UserService {
    async findUser(filter) {
        const user = await UserModel.findOne(filter);
        return user;
    }

    async createUser(data) {
        const user = await UserModel.create(data);
        return user;
    }

    async updateUserProfile(userId, updateData) {
        try {
            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
            // 'new: true' ensures that the updated document is returned
            return updatedUser;
        } catch (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
    }
}

export default new UserService();