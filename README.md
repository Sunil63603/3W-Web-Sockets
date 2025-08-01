Frontend : https://3-w-web-sockets.vercel.app/login

Backend : https://threew-web-sockets.onrender.com

Github Repo : https://github.com/Sunil63603/3W-Web-Sockets

MongoDB Atlas : https://cloud.mongodb.com/v2/6884575f597e69150587c8f1#/metrics/replicaSet/688457bc3b5e5422bb13e023/explorer/socketsDB

Note : Test the application on two diff chrome browsers as i am using localStorage to store current loggedIn userName. (two tabs in same browser will not work because of localStorage).

FrontEnd

Tech Stack : Create-React-App, MUI, Bootstrap(Because Task Planet also uses MUI and bootstrap), socket client

There are two main pages, ie. Login and Chat

After login, UserName will be stored in localStorage for persisting page reloads. So, testing this application on two diff tabs on same browser account will not work. Try using two diff browser accounts, or diff browsers all together.

Setup socket.io-client in socket.js file

Components in Chat Page are AllRoomsList(Left column) and RightChatUI(Right column).

UseChat context is used to share data between all react component.

Backend URL is stored as environment variable

In Chat.jsx, connect to socket and emit “register” event. And fetch onlineUsers List using “onlineUsers” event.

Disconnect socket if userName changes or user logs-out. Remove name from localStorage(using Logout button)

Theres a dropdown to see all online Users. Select and start 1-1 messaging(room is created using /api/rooms/create )

Fetch all rooms using ( /api/rooms/all ) on initial render and when new Grp is created.

Click on any room to join using “joinRoom” socket event. Then existing messages will be fetched( /api/messages/:roomId ) and display that room on leftChatUI

Create a new Room using ‘create room button’. (/api/rooms/createGrp)

Display onlineUsers in each room(by using all onlineUsers, filter them using roomId ).

“Typing" socket event to broadcast to all members of room

1-1 and grp Messaging are handled by diff functions

Database

Stack : MongoDB Atlas, mongoose

Backend/config/db.js is used to connect to DB.

User, Message,Room modals are used to work with collections

BACKEND

Server.js is entry file

Tech Stack : node, express and mongoose, socket

Backend/socket/index.js handles all socket events

Events : “connection”, “register”, “registered”, “onlineUsers”,”joinRoom”,”room:joined”, “roomCreated”,”chatMessage”,”typing”,”stopTyping”,”disconnect”

Thanks,

Sunil

whatsapp: 8197759383
mail: s60667843@gmail.com
linkedin: https://www.linkedin.com/in/Sunil63603/
github: https://github.com/Sunil63603
portfolio: https://sunilpersonalportfolio.netlify.app/
leetcode: https://leetcode.com/u/s60667843/
