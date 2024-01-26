/* eslint-disable react/prop-types */
import Button from "../../../../components/shared/CardButton/Button";
import styles from "./Phone.module.css";
import flag from "../../../../assets/Images/flag.png";
import { sendOtp } from "../../../../http";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setOtp } from "../../../../store/authSlice.js";

export default function Phone({ onNext }) {
    const dispath = useDispatch();
    const [number, setNumber] = useState("");
    const [loading, setLoading] = useState(false);
    async function submitHandler() {
        setLoading(true);
        const response = await sendOtp({
            type: "phone",
            sender: number,
        });
        console.log(response.data.otp);
        const { hash, sender } = response.data;
        dispath(
            setOtp({
                sender,
                hash,
            })
        );
        setLoading(false);
        onNext();
    }
    function onChangehandler(e) {
        const inputValue = e.target.value;

        if (!isNaN(inputValue) && inputValue.length <= 10) {
            // It's a number and its length is less than or equal to 10
            setNumber(inputValue);
        }
    }
    return (
        <div className={styles.cardContentWrapper}>
            <div className={styles.inputBox}>
                <img
                    src={flag}
                    alt="indian-flag"
                />
                <input
                    type="text"
                    className={styles.input}
                    placeholder="9876543210"
                    id="phone"
                    value={number}
                    onChange={onChangehandler}
                />
            </div>
            <Button
                text="Next"
                onClick={submitHandler}
                disabled={number.length < 10}
                loading={loading}
            />
            <p className={styles.termsText}>
                By entering your phone number you’re agreeing to our Terms of
                Service and Privacy Policy. Thanks!
            </p>
        </div>
    );
}
