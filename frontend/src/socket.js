import { io } from "socket.io-client"; //io method which creates socket instance.

//during development, this should match your backend origin(eg:localhost:5000)
const SOCKET_SERVER_URL = process.env.REACT_APP_BACKEND_URL; //for production, backend will be deployed on 'render'

console.log("socket server URL:", SOCKET_SERVER_URL); //same backend URL for REST and SOCKET

//create a Socket.io client instance but dont connect immediately.
export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: true, //automatic connection on page load
  transports: ["websocket"], //Use WebSocket as preferred transport method
  withCredentials: true, //send credentials if required(cookies,etc)
});
