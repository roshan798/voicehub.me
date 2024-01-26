import { useCallback, useEffect, useRef } from 'react';
import { useStateWithCallback } from './useStateWithCallback';
import socketInit from '../socket/index.js';
import { ACTIONS } from '../actions.js';
import freeice from 'freeice';

export function useWebRTC(roomId, user) {
	const [clients, setClients] = useStateWithCallback([]);
	const audioElements = useRef({});
	const connections = useRef({});
	const localMediaStream = useRef(null);
	const socket = useRef(null);
	const clientsRef = useRef([]);

	// Add a new client to the list
	const addNewClient = useCallback(
		(newClient, cb) => {
			setClients((existingClients) => {
				const isClientAlreadyPresent = existingClients.some(
					(client) => client.id === newClient.id
				);

				if (isClientAlreadyPresent) {
					return existingClients;
				}
				return [...existingClients, newClient];
			}, cb);
		},
		[setClients]
	);

	// Initialize WebRTC and Socket
	useEffect(() => {
		const initializeWebRTC = async () => {
			try {
				// Initialize socket
				socket.current = socketInit();

				// Event handlers for WebRTC
				const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
					if (peerId in connections.current) {
						return console.warn(`Already Connected with ${peerId} ${user.name}`);
					}

					// Initialize a new RTCPeerConnection
					connections.current[peerId] = new RTCPeerConnection({
						iceServers: freeice(),
					});

					// Handle new ice candidate
					connections.current[peerId].onicecandidate = (event) => {
						socket.current.emit(ACTIONS.RELAY_ICE, {
							peerId,
							icecandidate: event.candidate,
						});
					};

					// Handle on track on this connection
					connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
						addNewClient({ ...remoteUser, muted: true }, () => {
							if (audioElements.current[remoteUser.id]) {
								audioElements.current[remoteUser.id].srcObject = remoteStream;
								audioElements.current[remoteUser.id].volume = 0.8;
								audioElements.current[remoteUser.id].play();
							} else {
								let settled = false;
								const interval = setInterval(() => {
									if (audioElements.current[remoteUser.id]) {
										audioElements.current[remoteUser.id].srcObject = remoteStream;
										audioElements.current[remoteUser.id].volume = 0.8;
										audioElements.current[remoteUser.id].play();
										settled = true;
									}
									if (settled === true) {
										clearInterval(interval);
									}
								}, 1000);
							}
						});
					};

					// Add local tracks to remote connections
					localMediaStream.current
						.getTracks()
						.forEach((track) => {
							connections.current[peerId].addTrack(track, localMediaStream.current);
						});

					// Create offer if needed
					if (createOffer === true) {
						const offer = await connections.current[peerId].createOffer();
						await connections.current[peerId].setLocalDescription(offer);
						// Send offer to another client
						socket.current.emit(ACTIONS.RELAY_SDP, {
							peerId,
							sessionDescription: offer,
						});
					}
				};

				const handleIceCandidate = ({ peerId, icecandidate }) => {
					if (icecandidate) {
						connections.current[peerId].addIceCandidate(icecandidate);
					}
				};

				const handleRemoteSDP = async ({
					peerId,
					sessionDescription: remoteSessionDescription,
				}) => {
					connections.current[peerId].setRemoteDescription(
						new RTCSessionDescription(remoteSessionDescription)
					);

					// If session description is an offer, create an answer
					if (remoteSessionDescription.type === 'offer') {
						const connection = connections.current[peerId];
						const answer = await connection.createAnswer();
						connection.setLocalDescription(answer);
						// Send answer to the other client
						socket.current.emit(ACTIONS.RELAY_SDP, {
							peerId,
							sessionDescription: answer,
						});
					}
				};

				const handleRemovePeer = async ({ peerId, userId }) => {
					console.log("someone left the room", peerId, userId);
					if (connections.current[peerId]) {
						console.log("closing connection");
						connections.current[peerId].close();
					}
					delete connections.current[peerId];
					delete audioElements.current[peerId];

					// Remove the user from the clients list
					setClients((existingClients) => {
						return existingClients.filter((client) => client.id !== userId);
					});
				};

				const setMute = (mute, userId) => {
					const clientsIdx = clientsRef.current.map((client) => client.id).indexOf(userId);
					const connectedClients = JSON.parse(JSON.stringify(clientsRef.current));
					if (clientsIdx > -1) {
						connectedClients[clientsIdx].muted = mute;
						setClients(connectedClients);
					}
				};

				// Socket event listeners
				socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
				socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
				socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP);
				socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
				socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
					setMute(true, userId);
				});

				socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
					setMute(false, userId);
				});

				return () => {
					// Cleanup on component unmount
					socket.current.off(ACTIONS.ADD_PEER);
					socket.current.off(ACTIONS.ICE_CANDIDATE);
					socket.current.off(ACTIONS.SESSION_DESCRIPTION);
					socket.current.off(ACTIONS.REMOVE_PEER);
					socket.current.off(ACTIONS.MUTE);
					socket.current.off(ACTIONS.UNMUTE);
				};
			} catch (error) {
				// Handle initialization errors
				console.error('Error initializing WebRTC:', error);
				// You may want to provide user feedback or trigger a fallback mechanism
			}
		};

		initializeWebRTC();
	}, [addNewClient, setClients]);

	// Capture local media stream
	useEffect(() => {
		const startCapture = async () => {
			try {
				localMediaStream.current = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});

				/*
				log statements
				localMediaStream.current.getAudioTracks().forEach((track) => {
				  console.log('Audio Track:', track);
				  console.log('Is Muted:', !track.enabled); // Log whether the audio is muted or not
				});
				*/
				addNewClient({ ...user, muted: true }, () => {
					const localElement = audioElements.current[user.id];
					if (localElement) {
						localElement.volume = 0;
						localElement.srcObject = localMediaStream.current;
					}

					// Socket emit JOIN
					socket.current.emit(ACTIONS.JOIN, { roomId, user });
				});
			} catch (error) {
				// Handle media stream capture errors
				console.error('Error accessing user media:', error);
				// You may want to provide user feedback or trigger a fallback mechanism
			}
		};

		startCapture();

		// Cleanup when leaving the room
		return () => {
			// console.log('Leaving room')
			if (localMediaStream.current && localMediaStream.current.getTracks) {
				localMediaStream.current.getTracks().forEach((track) => {
					track.stop();
				});
			}
			socket.current.emit(ACTIONS.LEAVE, { roomId });
		};
	}, [addNewClient, roomId, user]);

	useEffect(() => {
		clientsRef.current = clients;
	}, [clients]);

	// Provide reference to audio elements
	const provideRef = (instance, userId) => {
		audioElements.current[userId] = instance;
	};

	// Handling mute
	const handleMute = (isMute, userId) => {
		let settled = false;
		const interval = setInterval(() => {
			if (localMediaStream.current) {
				const audioTrack = localMediaStream.current.getTracks()[0];
				if (audioTrack) {
					audioTrack.enabled = !isMute;
					// console.log(`Setting Mute - Audio Track: ${audioTrack.id}, Is Muted: ${!audioTrack.enabled}`);
				}

				if (isMute) {
					// Tell other clients that I have muted
					socket.current.emit(ACTIONS.MUTE, { roomId, userId });
				} else {
					socket.current.emit(ACTIONS.UNMUTE, { roomId, userId });
				}

				settled = true;
			}
			if (settled) clearInterval(interval);
		}, 200);
	};

	return { clients, provideRef, handleMute };
}
