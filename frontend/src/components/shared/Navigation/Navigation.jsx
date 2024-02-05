/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import logo from "../../../assets/Images/Emoji.png";
import logoutIcon from "../../../assets/Images/exit.png";
import styles from "./Navigation.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../../../store/authSlice.js";
import { logout } from "../../../http";
import { useRef } from "react";

const ProfileSection = ({ logoutUser, user }) => {
    const modalRef = useRef();
    const toggleModal = () => {
        modalRef.current.classList.toggle("hidden");
    };
    return (
        <>
            <div className={styles.right}>
                <div className={styles.profileContainer}>
                    {user.activated && (
                        <div className={styles.right}>
                            <img
                                src={user.avatar}
                                alt="user-avatar"
                                className={styles.avatar}
                                onClick={toggleModal}
                            />
                            <ul
                                className={`${styles.menu} hidden`}
                                ref={modalRef}>
                                <li>
                                    <Link
                                        to="/profile"
                                        className={styles.profileWrapper}
                                        onClick={toggleModal}>
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                        <p className="name">{user.name}</p>
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        className={`${styles.logoutBtn} transition`}
                                        onClick={logoutUser}>
                                            <img src={logoutIcon} className="transition"/>
                                        Log out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default function Navigation() {
    const dispatch = useDispatch();
    const { user, isAuth } = useSelector((state) => state.authSlice);
    const logoutUser = async () => {
        try {
            const { data } = await logout();
            dispatch(setAuth({ data: data }));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.wrapper}>
                <Link
                    to="/"
                    className={styles.logoWrapper}>
                    <img
                        src={logo}
                        alt=""
                        className={styles.emoji}
                    />
                    <span>Voicehub</span>
                </Link>
                {isAuth === true && user != null && (
                    <ProfileSection
                        logoutUser={logoutUser}
                        user={user}
                    />
                )}
            </div>
        </nav>
    );
}
