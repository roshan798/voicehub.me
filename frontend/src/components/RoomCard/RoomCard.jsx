/* eslint-disable react/prop-types */
import styles from "./RoomCard.module.css";
import chatIcon from "../../assets/Images/chatIcon.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import { useNavigate } from "react-router-dom";
import MenuIcon from "../../assets/icons/MenuIcon";
import { useState } from "react";


export default function RoomCard({ room, deleteRoom }) {
    const { topic: title, speakers, owner, id: roomId } = room;
    const [showModal, setShowModal] = useState(false); // Initially false
    const navigate = useNavigate();
    const handleMenuClick = (event) => {
        event.stopPropagation(); // Prevent navigation
        setShowModal(!showModal);
    };

    return (
        <>
            <div className={`${styles.card} transition`}>
                <div
                    className={styles.cardLeft}
                    onClick={() => {
                        navigate(`/room/${roomId}`);
                    }}>
                    <p className={styles.title}>{title}</p>
                    <div className={styles.detailsContainer}>
                        <div className={styles.avatarContainer}>
                            <img
                                src={
                                    speakers.length
                                        ? speakers[0].avatar
                                        : owner.avatar
                                }
                                alt={
                                    speakers.length
                                        ? speakers[0].name
                                        : owner.name
                                }
                            />
                            {speakers.length >= 2 && (
                                <img
                                    src={speakers[1].avatar}
                                    alt=""
                                />
                            )}
                        </div>
                        <div className={styles.speakersNames}>
                            <div className={styles.names}>
                                <p>
                                    {speakers.length
                                        ? speakers[0].name
                                        : owner.name}
                                </p>
                                <img src={chatIcon} />
                            </div>
                            {speakers.length > 1 && (
                                <div className={styles.names}>
                                    <p>{speakers[1].name}</p>
                                    <img src={chatIcon} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.right}>
                    <div style={{ position: "relative" }}>
                        <button
                            className={styles.menu}
                            onClick={handleMenuClick}>
                            <MenuIcon />
                        </button>
                        {showModal && (
                            <div className={styles.modal}>
                                <button onClick={() => deleteRoom(room.id)}>
                                    Delete Room
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <span>{speakers.length}</span>
                        <img
                            src={peopleVoiceIcon}
                            alt=""
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
