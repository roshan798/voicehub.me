/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { getAllRooms } from "../../http/index.js";
import styles from "./Rooms.module.css";
import searchIcon from "../../assets/Images/search.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import RoomCard from "../../components/RoomCard/RoomCard";
import AddRoomModal from "../../components/AddRoomModal/AddRoomModal";

export default function Rooms() {
    const [showModal, setShowModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await getAllRooms();
            setRooms(data.allRooms);
        };
        fetchRooms();
    }, []);
    const toggleModal = () => {
        setShowModal((state) => !state);
    };
    return (
        <>
            <div className={styles.roomsContainer}>
                <div className={styles.headingWrapper}>
                    <div className={styles.left}>
                        <p className={styles.headingText}>All voice rooms</p>
                        <div className={styles.searchBox}>
                            <label htmlFor="search-box">
                                <img
                                    src={searchIcon}
                                    alt=""
                                    className={styles.searchIcon}
                                />
                            </label>
                            <input
                                type="text"
                                id="search-box"
                            />
                        </div>
                    </div>
                    <div className={styles.right}>
                        <button
                            className={`${styles.startRoomBtn} transition`}
                            onClick={toggleModal}>
                            <img
                                src={peopleVoiceIcon}
                                alt=""
                            />
                            Start a room
                        </button>
                    </div>
                </div>
                <div className={styles.roomsCardsWrapper}>
                    {rooms.length > 0 ? (
                        rooms.map((room, index) => {
                            return (
                                <RoomCard
                                    roomId={room.id}
                                    title={room.topic}
                                    speakers={room.speakers}
                                    key={index}
                                    ownerId={room.ownerId}
                                />
                            );
                        })
                    ) : (
                        <div>No rooms found</div>
                    )}
                </div>
            </div>
            {showModal && <AddRoomModal toggleModal={toggleModal} />}
        </>
    );
}

