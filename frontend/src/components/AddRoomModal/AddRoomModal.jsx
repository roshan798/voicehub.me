import styles from "./AddRoomModal.module.css";
import globe from "../../assets/Images/globe.png";
import group from "../../assets/Images/group.png";
import lock from "../../assets/Images/lock.png";
import party from "../../assets/Images/party.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom as createRoomOnBackend } from "../../http/index";

// eslint-disable-next-line react/prop-types
export default function AddRoomModal({ toggleModal }) {
    const navigate = useNavigate();
    const [roomType, setRoomType] = useState("open");
    const [topic, setTopic] = useState("");
    const createRoom = async () => {
        if (topic === "") return;
        try {
            const { data } = await createRoomOnBackend({
                topic,
                roomType,
            });
            navigate(`/room/${data.id}`);
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <div className={styles.modalMask}>
                <div className={styles.cardBody}>
                    <div
                        className={styles.cross}
                        onClick={toggleModal}>
                        X
                    </div>
                    <div className={styles.modalHeader}>
                        <h3>Enter a topic to be disscussed</h3>
                        <input
                            type="text"
                            className={styles.inputBox}
                            value={topic}
                            onChange={(e) => {
                                setTopic(e.target.value);
                            }}
                        />
                        <div className={styles.typesContainer}>
                            <h3>Room type</h3>
                            <div className={styles.types}>
                                <div
                                    className={`${styles.type} transition ${
                                        roomType === "open"
                                            ? styles.selected
                                            : ""
                                    }`}>
                                    <img
                                        src={globe}
                                        alt="Open"
                                    />
                                    <p>Open</p>
                                </div>
                                <div
                                    className={`${styles.type} transition ${
                                        roomType === "social"
                                            ? styles.selected
                                            : ""
                                    }`}>
                                    <img
                                        src={group}
                                        alt="Social"
                                    />
                                    <p>Social</p>
                                </div>
                                <div
                                    className={`${styles.type} transition ${
                                        roomType === "closed"
                                            ? styles.selected
                                            : ""
                                    }`}>
                                    <img
                                        src={lock}
                                        alt="Closed"
                                    />
                                    <p>Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <h3>Start a room, open to everyone</h3>
                        <button
                            className={`${styles.btn} transition`}
                            onClick={createRoom}>
                            <img
                                src={party}
                                alt="arrow-forward"
                                className={styles.arrowForward}
                            />
                            Let's Go
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
