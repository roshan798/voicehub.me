import styles from "./StepOtp.module.css";
import lock from "../../../assets/Images/lock.png";
import Button from "../../../components/shared/CardButton/Button.jsx";
import Card from "../../../components/shared/Card/Card.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { verifyOtp } from "../../../http/index.js";
import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "../../../store/authSlice.js";

import OtpInputs from "./OtpInputs.jsx";

export default function StepOtp() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [error, setError] = useState(null);
    const { sender, hash, type } = useSelector((state) => {
        return state.authSlice.otp;
    });
    const handleClik = async () => {
        const OTP = otp.join("");
        try {
            const res = await verifyOtp({
                otp: OTP,
                sender,
                hash,
                type,
            });
            if (res) {
                console.log("respone =>>", res);
                const { data } = res;
                dispatch(setAuth({ data }));
            }
            navigate("/activate");
        } catch (error) {
            const { data } = error.response;
            console.log("insedie step otp catch", data);
            setError(data?.message);
        }
        setOtp(["", "", "", ""]);
    };
    return (
        <div className="card-wrapper">
            <Card
                title="Enter the OTP we've just texted you"
                emoji={lock}>
                <div className={styles.cardContentWrapper}>
                    <OtpInputs
                        otp={otp}
                        setOtp={setOtp}
                        error={error}
                        setError={setError}
                    />

                    <Button
                        text="Next"
                        onClick={handleClik}
                    />
                    <p className={styles.termsText}>
                        By entering your email you’re agreeing to our Terms of
                        Service and Privacy Policy. Thanks!
                    </p>
                </div>
            </Card>
        </div>
    );
}
