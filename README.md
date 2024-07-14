# VoiceHub

VoiceHub represents a unique web application tailored for real-time voice communication. Unlike traditional video conferencing solutions, VoiceHub emphasizes the power of voice, offering users an exclusive platform for immersive conversations. Within VoiceHub, users can effortlessly create custom voice rooms and invite others, fostering engaging discussions and connections in a streamlined environment.

## Features

- **Voice Rooms:** Users can create voice rooms and invite others to join.
  - **Open Rooms:** Open rooms can be joined by anyone without any restrictions.
  - **Social Rooms:** Social rooms require users to request permission from the room owner before they can join.
- **Real-time Voice Calls:** Participants in a voice room can engage in real-time voice conversations.
- **User Authentication:** User authentication is implemented using email and phone OTP for secure access.
- **WebRTC:** Real-time communication is facilitated using WebRTC technology for peer-to-peer audio streaming.
- **Socket.IO:** Socket.IO is used for real-time bidirectional event-based communication between the client and server.
- **Dockerized Application:** The application is containerized using Docker and Docker Compose for easy deployment and scalability.
- **MongoDB Database:** MongoDB is used as the backend database for storing user data and room information.
- **Live Deployment:** The application is deployed on aws and accessible at [VoiceHub.me](https://www.voicehub.me).

## Technologies Used

- Frontend: React
- Backend: Node.js with Express
- Database: MongoDB
- Real-time Communication: WebRTC, Socket.IO
- Containerization: Docker, Docker Compose
- Authentication: Email and Phone OTP

## Getting Started

To run VoiceHub locally, follow these steps:

1. Clone the repository:

```
https://github.com/roshan798/voicehub.me.git
```

2. Navigate to the project directory:
```
cd voicehub
```

3. Install dependencies for both frontend and backend:
```
cd frontend
npm install
cd ../backend
npm install
```

4. Set up environment variables:

   - Copy the .env.dev to a `.env` file in the both frontend and the backend directories.
   - Add environment variables for MongoDB connection string, JWT secret, and other necessary configurations.

5. Run both frontend and backend in separate terminals using the command:
```bash
npm run dev
```
Access the application in your browser at `http://localhost:5173`.

## Contributing

Contributions are welcome! If you'd like to contribute to VoiceHub, please follow these guidelines:
- Fork the repository
- Create a new branch (`git checkout -b branch_name`)
- Make your changes
- Commit your changes (`git commit -am 'commit_message'`)
- Push to the branch (`git push origin branch_name`)
- Create a new Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
