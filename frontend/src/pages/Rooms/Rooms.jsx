/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { getAllRooms } from "../../http/index.js";
import debounce from "../../utils/debounceFunction.js";
import styles from "./Rooms.module.css";
import searchIcon from "../../assets/Images/search.png";
import peopleVoiceIcon from "../../assets/Images/peopleVoice.png";
import RoomCard from "../../components/RoomCard/RoomCard";
import AddRoomModal from "../../components/AddRoomModal/AddRoomModal";

const RESULTS_PER_PAGE = 6;

export default function Rooms() {
    const [showModal, setShowModal] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const roomsCopy = useRef([]);

    useEffect(() => {
        const fetchRooms = async (page) => {
            const { data } = await getAllRooms(page, RESULTS_PER_PAGE);
            setRooms(data.allRooms);
            setTotalPages(data.totalPages);
            roomsCopy.current = data.allRooms;
        };
        fetchRooms(page);
    }, [page]);

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

    const handlePrevPage = () => {
        setPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setPage((prevPage) => Math.min(prevPage + 1, totalPages));
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
                                    room={room}
                                    key={index}
                                />
                            );
                        })
                    ) : (
                        <div>No rooms found</div>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className={styles.paginationWrapper}>
                        <button
                            className={styles.paginationButton}
                            onClick={handlePrevPage}
                            disabled={page === 1}>
                            Prev
                        </button>
                        <span className={styles.pageInfo}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className={styles.paginationButton}
                            onClick={handleNextPage}
                            disabled={page === totalPages}>
                            Next
                        </button>
                    </div>
                )}
            </div>
            {showModal && <AddRoomModal toggleModal={toggleModal} />}
        </>
    );
}
