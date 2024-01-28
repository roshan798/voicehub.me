import styles from "./profile.module.css";
import { useSelector } from "react-redux";
import { useState } from "react";
import { updateProfile } from "../../http";
import { useDispatch } from "react-redux";
import { setAuth } from "../../store/authSlice";

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.authSlice);
    const [userDetails, setUserDetails] = useState(user);
    console.log(userDetails);
    const handleUpdateDetail = async () => {
        const { id, name, email, avatar } = userDetails;
        const {
            id: userId,
            name: userName,
            email: userEmail,
            avatar: userAvatar,
        } = user;

        if (name === userName && email === userEmail && avatar === userAvatar) {
            console.log("No changes found.");
            return;
        } else {
            console.log("Changes found.");
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
                dispatch(setAuth({ data: data }));
            } catch (error) {
                console.log(error);
            }
        }
    };
    const captureImage = (e) => {
        try {
            const file = e.target.files[0];
            const fileSizeKB = Math.round(file.size / 1024); // Convert file size to KB
            console.log(fileSizeKB + " KB");
            if (fileSizeKB > 1024) {
                alert("File size should be less than 1MB");
                return;
            }
            if (file instanceof Blob) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    setUserDetails((detail) => ({
                        ...detail,
                        avatar: reader.result,
                        imageSize: fileSizeKB, // Add the image size in KB to userDetails
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
                {!user.email && <label
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
                    />
                </label> }
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
