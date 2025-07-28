import { io } from "socket.io-client"; //io method which creates socket instance

//❌define backend server URL for Socket.io connection(❌why are we doing this in frontend folders?)
//during development, this should match your backend origin(eg:localhost:5000)
//In Production,you can leave it undefined and it will use the current origin.

const SOCKET_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? undefined
    : `${process.env.REACT_APP_BACKEND_URL}`;

console.log(process.env.REACT_APP_BACKEND_URL);

//create a Socket.io client instance but dont connect immediately
//autoConnect:false ensures that connection happens manually after userName is available.
export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false, //Prevent automatic connection on page load
  transports: ["websocket"], //Use WebSocket as preferred transport method
  withCredentials: true, //send credentials if required(cookies,etc)
});
