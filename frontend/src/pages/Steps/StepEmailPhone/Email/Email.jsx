/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import styles from "./Email.module.css";
import Button from "../../../../components/shared/CardButton/Button.jsx";
import { sendOtp } from "../../../../http/index.js";
import { setOtp } from "../../../../store/authSlice.js";
import { useDispatch } from "react-redux";
import showToastMessage from "../../../../utils/showToastMessage.js"
export default function Email({ onNext }) {
    const dispath = useDispatch();
    const emailRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        if (!email || email.length === 0) return false; // Assuming you want to handle empty emails separately

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    async function submitHandler() {
        setLoading(true);
        const email = emailRef.current.value;
        if (validateEmail(email) === false) {
            showToastMessage("warning", "Enter a valid email!", "dark");
            setLoading(false);
            return;
        }
        // step 2 : send post request to send otp
        // add the error handling
        const response = await sendOtp({
            type: "email",
            sender: email,
        });
        const { hash, sender } = response.data;
        // REMOVE IT
        const otp = response.data.otp;
        alert(`Your OTP is ${otp}`);
        dispath(
            setOtp({
                sender,
                hash,
                type : "email"
            })
        );
        setLoading(false);
        onNext();
    }

    return (
        <div className={styles.cardContentWrapper}>
            <div className={styles.inputBox}>
                <input
                    type="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    id="email"
                    autoComplete="email"
                    ref={emailRef}
                />
            </div>
            <Button
                text="Next"
                onClick={submitHandler}
                loading={loading}
            />
            <p className={styles.termsText}>
                By entering your email you’re agreeing to our Terms of Service
                and Privacy Policy. Thanks!
            </p>
        </div>
    );
}
