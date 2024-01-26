import crypto from 'crypto';
import dotenv from'dotenv';
dotenv.config();
class HashService {
    hashOtp(otp) {
        const hashedOtp = crypto.createHmac('sha256',process.env.HASH_SECRET).update(otp).digest('hex');
        return hashedOtp;
    }
}
export default new HashService();