import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
});

export default socket;
