/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { getAllRooms } from "../../http/index.js";
import debounce from "../../utils/debounceFunction.js";
import styles from "./Rooms.module.css";
import searchIcon from "../../assets/Images/search.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import RoomCard from "../../components/RoomCard/RoomCard";
import AddRoomModal from "../../components/AddRoomModal/AddRoomModal";

export default function Rooms() {
    const [showModal, setShowModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const roomsCopy = useRef([]);
    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await getAllRooms();
            setRooms(data.allRooms);
            roomsCopy.current = data.allRooms;
        };
        fetchRooms();
    }, []);
    const toggleModal = () => {
        setShowModal((state) => !state);
    };

    const handleSearch = debounce((e) => {
        const searchValue = e.target.value;
        const filteredRooms = roomsCopy.current.filter((room) => {
            return room.topic.toLowerCase().includes(searchValue.toLowerCase());
        });
        setRooms(filteredRooms);
    }, 300);
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
                                placeholder="Discover rooms"
                                onChange={handleSearch}
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
