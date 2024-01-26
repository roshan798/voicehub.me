/* eslint-disable react/prop-types */
import { useState } from "react";
import styles from "./RoomCard.module.css";
import chatIcon from "../../assets/Images/chatIcon.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import kababMenu from "../../assets/Images/kababMenu.png";
import { useNavigate } from "react-router-dom";
export default function RoomCard({ roomId, title, speakers }) {
    const navigate = useNavigate();
    return (
        <>
            <div
                className={styles.card}
                onClick={() => {
                    navigate(`/room/${roomId}`);
                }}>
                <div className={styles.cardLeft}>
                    <p className={styles.title}>{title}</p>
                    <div className={styles.detailsContainer}>
                        <div className={styles.avatarContainer}>
                            <img
                                src={speakers[0].avatar}
                                alt=""
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
                                <p>{speakers[0].name}</p>
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
                    <div className={styles.menu}>
                        <img
                            src={kababMenu}
                            alt=""
                            className={styles.kababMenuIcon}
                        />
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
