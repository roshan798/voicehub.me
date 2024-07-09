import { Link } from "react-router-dom"; // Import Link from react-router-dom
import styles from "./RequestPending.module.css";

export default function RequestPendingPage(props) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Request Pending</h1>
            <p className={styles.message}>
                Your request is currently pending. Please wait for approval.
            </p>
            <Link
                to="/rooms"
                className={styles.button}>
                Discover Rooms
            </Link>
        </div>
    );
}
