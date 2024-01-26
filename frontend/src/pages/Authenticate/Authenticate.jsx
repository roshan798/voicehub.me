import StepEmailPhone from "../Steps/StepEmailPhone/StepEmailPhone.jsx";
import stepOtp from "../Steps/StepOtp/StepOtp.jsx";
import { useState } from "react";
export default function Authenticate() {
    const steps = {
        1: StepEmailPhone,
        2: stepOtp,
    };
    const [step, setStep] = useState(1);
    const Step = steps[step];
    const nextStep = () => {
        setStep(step + 1);
    };

    return (
        <>
            <Step onNext={nextStep} />
        </>
    );
}
