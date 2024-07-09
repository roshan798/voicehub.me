import LinkedinIcon from "../../../assets/icons/LinkedinIcon";
import GithubIcon from "../../../assets/icons/GithubIcon";
import styles from "./Footer.module.css";

const Footer = () => (
    <footer className={styles.footerContainer}>
        <span>
            <a href="https://personal-portfolio-eight-neon.vercel.app/#home">
                <span className={styles.author}>Roshan Kumar</span>
            </a>{" "}
            | © 2024 Made with 💖 from India
        </span>
        <div className={styles.socialIcons}>
            <a
                href="https://github.com/roshan798"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.icon}>
                <GithubIcon className={`${styles.github}`} />
            </a>
            <a
                href="https://www.linkedin.com/in/roshan-kumar7989/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.icon}>
                <LinkedinIcon className={` ${styles.linkedin}`} />
            </a>
        </div>
    </footer>
);

export default Footer;
