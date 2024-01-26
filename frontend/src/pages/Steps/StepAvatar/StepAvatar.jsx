/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import styles from "./StepAvatar.module.css";
import Button from "../../../components/shared/CardButton/Button";
import Card from "../../../components/shared/Card/Card";
import monkeyEmogi from "../../../assets/Images/monkey.png";
import { useSelector, useDispatch } from "react-redux";
import { setAvatar } from "../../../store/activateSlice";
import { activate } from "../../../http/index.js";
import { setAuth } from "../../../store/authSlice.js";
import Loader from "../../../components/shared/Loader/Loader.jsx";
export default function StepAvatar() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { name, avatar } = useSelector((state) => {
        return state.activateSlice;
    });

    const [image, setImage] = useState(avatar);

    const captureImage = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImage(reader.result);
            dispatch(setAvatar(reader.result));
        };
    };
    const submit = async () => {
        setLoading(true);
        try {
            const resp = await activate({ name, avatar });
            if (resp.data.auth) {
                const data = { ...resp.data };
                dispatch(setAuth({ data: data }));
            }
            // console.log(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {loading ? (
                <Loader message={"Activaion in progress..."} />
            ) : (
                <div className="card-wrapper">
                    <Card
                        emoji={monkeyEmogi}
                        title={`Okay, ${name}!`}>
                        <p className={styles.subHeading}>How's this photo?</p>
                        <div className="avatarWrapper">
                            <img
                                src={image}
                                alt="avatar"
                                className={styles.avatar}
                            />
                            <div>
                                <input
                                    type="file"
                                    name=""
                                    id="avatarInput"
                                    className={styles.avatarInput}
                                    onChange={captureImage}
                                />
                                <label htmlFor="avatarInput">
                                    Choose a different picture
                                </label>
                            </div>
                        </div>
                        <Button
                            text={"Next"}
                            onClick={submit}
                        />
                    </Card>
                </div>
            )}
        </>
    );
}
