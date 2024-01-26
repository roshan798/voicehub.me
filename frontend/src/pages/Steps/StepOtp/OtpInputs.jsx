/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import styles from "./OtpInputs.module.css";
export default function OtpInputs({ otp, setOtp, error, setError }) {
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = (e, index) => {
        if (error) setError(null);
        const { value } = e.target;
        if (!isNaN(value) && value !== "") {
            setOtp((prevOtp) => {
                const newOtp = [...prevOtp];
                newOtp[index] = value;
                return newOtp;
            });
            if (index < otp.length - 1) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e) => {
        const keyCode = parseInt(e.key);
        if (
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key !== "Tab" &&
            !((e.metaKey && e.key === "v") || (e.ctrlKey && e.key === "v")) &&
            !(keyCode >= 0 && keyCode <= 9)
        ) {
            e.preventDefault();
        }
    };

    const handleKeyUp = (e, index) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            setOtp((prevValue) => {
                const newArray = [...prevValue];
                newArray[index] = "";
                return newArray;
            });

            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e, index) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").split("");
        let newInputValue = [...otp];
        if (paste.every((item) => !isNaN(Number(item)))) {
            for (let i = 0; i < paste.length; i++) {
                if (index + i < otp.length) {
                    newInputValue[index + i] = paste[i];
                }
            }
        }
        setOtp(newInputValue);
    };
    return (
        <div>
            <div className={styles.inputWrapper}>
                {otp.map((value, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        inputMode="numeric"
                        type="text"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleInputChange(e, index)}
                        onKeyUp={(e) => handleKeyUp(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={(e) => handlePaste(e, index)}
                        autoComplete="off"
                        className={styles.input}
                    />
                ))}
            </div>
            {/* <span className={styles.error}>{error ? error : ""}</span> */}
        </div>
    );
}
