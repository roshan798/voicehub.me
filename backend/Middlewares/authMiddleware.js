import tokenService from "../services/tokenService.js";

export default async function (req, res, next) {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            throw new Error();
        }
        const userData = await tokenService.verifyAccessToken(accessToken);
        if(!userData){
            throw new Error("User not found!");
        }
        req.user = userData;
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
    next();
}