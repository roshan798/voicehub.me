import jwt from 'jsonwebtoken'
import refreshModal from '../Models/refreshModal.js';
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
class TokenService {
    generateTokens(payload) {

        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        })
        const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
            expiresIn: '1y'
        })
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(token, userId) {
        try {
            await refreshModal.create(
                {
                    token: token,
                    userId: userId,
                }
            )
        } catch (error) {
            console.log(error.message);
        }
    }
    async verifyAccessToken(token) {
        return jwt.verify(token, ACCESS_TOKEN_SECRET)
    }
    async verifyRefreshToken(refreshToken) {
        return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    }
    async findRefreshToken(userId, refreshToken) {
        return await refreshModal.findOne(
            {
                userId: userId,
                token: refreshToken
            }
        );
    }
    async updateRefreshToken(userId, refreshToken) {
        return await refreshModal.updateOne({ _id: userId }, { token: refreshToken })
    }
    async removeToken(refreshToken) {
        return await refreshModal.deleteOne({ token: refreshToken });
    }
}

export default new TokenService();