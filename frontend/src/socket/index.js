
import { io } from "socket.io-client";
const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectioAttempt: 'Infinity',
        timeout: 10000,
        transport: ['websocket']
    }
    return io(import.meta.env.VITE_REACT_APP_API_URL, options);
}
export default socketInit;