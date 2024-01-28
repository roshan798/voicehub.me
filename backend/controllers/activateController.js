import userService from "../services/userService.js";
import UserDto from "../dtos/userDtos.js";
class ActivateController {
    async activate(req, res) {
        const { name, avatar } = req.body;
        if (!name || !avatar) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        let imagePath = 'default.png'
        try {
            imagePath = await userService.setAvatar(avatar, false);
        }
        catch (error) {
            return res.status(500).json({
                message: "could not process the image",
                error
            });
        }
        const userId = req.user._id;
        const userData = {
            name,
            avatar: `/storage/${imagePath}`,
            activated: true, 
        }
        try {
            const user = await userService.updateUserProfile(userId, userData);
            res.json({
                auth: true,
                user: new UserDto(user)
            })
        } catch (error) {
            res.status(500).json({
                message: error ? error : "something went wrong",
            })
        }
    }

}

export default new ActivateController();