import styles from "./profile.module.css";
import { useSelector } from "react-redux";
import { useState } from "react";
import { updateProfile } from "../../http";
import { useDispatch } from "react-redux";
import { setAuth } from "../../store/authSlice";
import showToastMessage from "../../utils/showToastMessage.js";
const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.authSlice);
    const [userDetails, setUserDetails] = useState(user);
    const handleUpdateDetail = async () => {
        const { name, email, avatar } = userDetails;
        const {
            id: userId,
            name: userName,
            email: userEmail,
            avatar: userAvatar,
        } = user;

        if (name === userName && email === userEmail && avatar === userAvatar) {
            return;
        } else {
            const updatedUser = {
                id: userId,
                changes: {
                    ...(name !== userName && { name }),
                    ...(email !== userEmail && { email }),
                    ...(avatar !== userAvatar && { avatar }),
                    avatarChanged: avatar !== userAvatar, // Add the avatarChanged flag
                    previousAvatar:
                        avatar !== userAvatar ? userAvatar : undefined, // Add the previousAvatar path if avatar is changed
                },
            };

            try {
                const { data } = await updateProfile(updatedUser);
                showToastMessage("success", "Profile updated!", "dark");
                dispatch(setAuth({ data: data }));
            } catch (error) {
                showToastMessage("error", error.message, "dark");
                console.log(error);
            }
        }
    };
    const captureImage = (e) => {
        try {
            const file = e.target.files[0];
            const fileSizeKB = Math.round(file.size / 1024); // Convert file size to KB
            if (fileSizeKB > 1024) {
                // alert("File size should be less than 1MB");
                showToastMessage("warning", "File size should be less than 1MB", "dark")
                return;
            }
            if (file instanceof Blob) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    setUserDetails((detail) => ({
                        ...detail,
                        avatar: reader.result,
                        imageSize: fileSizeKB, 
                    }));
                };
            } else {
                console.error("Invalid file selected.");
            }
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div className={styles.wrapper}>
            <div className={styles.formContainer}>
                <h2>Basic info</h2>
                <div className={styles.avatarWrapper}>
                    <img
                        src={userDetails.avatar}
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
                <label
                    htmlFor="name"
                    className={styles.inputBox}>
                    Name
                    <input
                        id="name"
                        type="text"
                        className={styles.input}
                        value={userDetails.name}
                        onChange={(e) => {
                            setUserDetails({
                                ...userDetails,
                                name: e.target.value,
                            });
                        }}
                    />
                </label>
                <label
                    htmlFor="email"
                    className={styles.inputBox}>
                    Email
                    <input
                        id="email"
                        type="text"
                        className={styles.input}
                        value={userDetails?.email}
                        onChange={(e) => {
                            setUserDetails({
                                ...userDetails,
                                email: e.target.value,
                            });
                        }}
                        disabled={user.email ? true : false}
                    />
                </label>
                <label
                    htmlFor="phone"
                    className={styles.inputBox}>
                    Phone
                    <input
                        id="phone"
                        type="text"
                        className={styles.input}
                        value={userDetails?.phone}
                        onChange={(e) => {
                            setUserDetails({
                                ...userDetails,
                                phone: e.target.value,
                            });
                        }}
                        disabled={user.phone ? true : false}
                    />
                </label>

                <button
                    className={`${styles.btn} transition`}
                    onClick={handleUpdateDetail}>
                    Update Profile
                </button>
            </div>
        </div>
    );
};

export default Profile;
