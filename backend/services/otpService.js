dotenv.config();
import dotenv from 'dotenv';
import crypto from 'crypto';
import twilio from 'twilio';
import HashService from './hashService.js';
import nodemailer from 'nodemailer'


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// currently using ethereal for development
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'marilie.herzog@ethereal.email',
        pass: '6BGSSqzZAbJYhxQuPA'
    }
});

class OtpService {
    async generateOtp() {
        return new Promise((resolve, reject) => {
            try {
                const otp = crypto.randomInt(1000, 9999);
                resolve(otp);
            } catch (error) {
                reject(error);
            }
        })
    }
    async sendBySMS(phoneNumber, otp) {
        return await client.messages.create(
            {
                from: process.env.SMS_FROM_NUMBER,
                to: phoneNumber,
                body: `Your Coders house OTP is ${otp}`
            });
    }

    async sendByEmail(email, otp) {
        return await transporter.sendMail({
            from: '"codershouse",<rsahu7989@gmail.com>',
            to: email,
            subject: "codershouse login OTP",
            text: `Your codershouse login OTP is ${otp}.`
        });
    }

    verifyOtp(data, hash) {
        const computedHash = HashService.hashOtp(data);
        const res = (computedHash === hash);
        return res;
    }
}
export default new OtpService();