import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Error404.module.css";

export default function Error404() {
    const location = useLocation();
    const navigate = useNavigate();
    const error = location.state?.error;
    const fallBackPath = location.state?.to || "/";

    const handleBackClick = () => {
        navigate(fallBackPath); // navigate to the previous page
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>404</h1>
            <p className={styles.message}>Page not found</p>
            {error && <p className={styles.error}>{error}</p>}
            <button
                onClick={handleBackClick}
                className={styles.backButton}>
                Go Back
            </button>
        </div>
    );
}
