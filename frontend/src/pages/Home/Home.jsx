/* eslint-disable react/no-unescaped-entities */
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Card from "../../components/shared/Card/Card";
import emoji from "../../assets/Images/Emoji.png";
import Button from "../../components/shared/CardButton/Button";
export default function Home() {
    const navigate = useNavigate();
    const startRegister = () => {
        navigate("/authenticate");
    };
    return (
        <div className="card-wrapper">
            <Card
                emoji={emoji}
                title="Welcome to coders house">
                <p className={styles.text}>
                    We're working hard to get a coder's house ready for
                    everyone! While we wrap up the finishing touches, we're
                    adding people gradually to make sure nothing breaks :)
                </p>
                <Button
                   text="Let's go"
                    onClick={startRegister}
                />
            </Card>
        </div>
    );
}
