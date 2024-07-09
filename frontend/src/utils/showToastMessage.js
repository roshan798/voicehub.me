import { toast } from "react-toastify";

export default function showToastMessage(type, msg, theme = "dark") {
    if (type === "success") {
        return toast.success(msg, {
            position: toast.POSITION.TOP_RIGHT,
            theme: theme,
            className: 'dark-toast'
        });
    }
    else if (type === "error") {
        return toast.error(msg, {
            position: toast.POSITION.TOP_RIGHT,
            theme: theme,
            className: 'dark-toast'
        });
    }
    else if (type === "warning") {
        return toast.warning(msg, {
            position: toast.POSITION.TOP_RIGHT,
            theme: theme,
            className: 'dark-toast'
        });
    }
}
