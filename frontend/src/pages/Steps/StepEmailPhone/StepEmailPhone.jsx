import styles from "./StepEmailPhone.module.css";
import Card from "../../../components/shared/Card/Card";
import emailIcon from "../../../assets/Images/mail-icon.png";
import phoneIcon from "../../../assets/Images/Call.png";
import callIcon from "../../../assets/Images/phone-icon.png";
import mailIcon from "../../../assets/Images/Email.png";
import Email from "./Email/Email.jsx";
import Phone from "./Phone/Phone.jsx";
import { useState } from "react";
export default function stepEmailPhone({ onNext }) {
    const component = {
        phone: {
            element: Phone,
            emoji: phoneIcon,
        },
        email: {
            element: Email,
            emoji: mailIcon,
        },
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentType, setCurrentType] = useState("email");
    const Component = component[currentType].element;
    const changeType = (type) => {
        setCurrentType(type);
    };
    return (
        <div className="card-wrapper">
            <div className={styles.tabWrapper}>
                <button onClick={() => changeType("phone")} className={`${currentType=='phone' ? styles.active : ""}`}>
                    <img src={callIcon} alt="phone" />
                </button>
                <button onClick={() => changeType("email")} className={`${currentType=='email' ? styles.active : ""}`}>
                    <img src={emailIcon} alt="email" />
                </button>
            </div>
            <Card
                title="Welcome to Coder’s House"
                emoji={component[currentType].emoji}>
                <Component onNext={onNext} />
                
            </Card>
        </div>
    );
}
