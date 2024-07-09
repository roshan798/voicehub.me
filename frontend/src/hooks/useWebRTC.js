/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useRef } from 'react';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';
import socketInit from '../socket/index.js';
import { ACTIONS } from '../actions.js';
import showToastMessage from "../utils/showToastMessage.js"

export function useWebRTC(roomId, user) {
	const socket = useRef(null);
	const audioElements = useRef({});
	const connections = useRef({});
	const localMediaStream = useRef(null);
	const clientsRef = useRef([]);

	const [clients, setClients] = useStateWithCallback([]);
	const [joinRequests, setJoinRequests] = useStateWithCallback([])
	const [approvedToJoin, setApprovedToJoin] = useStateWithCallback(true)

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

	// start Capture
	const startCapture = async () => {
		try {
			localMediaStream.current = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,  // Enable echo cancellation
					noiseSuppression: true, // Enable noise suppression
					autoGainControl: true,  // Enable automatic gain control
				},
			});

			addNewClient({ ...user, muted: true }, () => {
				const localElement = audioElements.current[user.id];
				if (localElement) {
					// localElement.volume = 0;
					localElement.srcObject = localMediaStream.current;
				}
				// Ensure the local audio is muted
				localMediaStream.current.getAudioTracks().forEach((track) => {
					track.enabled = false; // Mute the audio
				});

				// Socket emit JOIN
				socket.current.emit(ACTIONS.JOIN, { roomId, user });
			});
		} catch (error) {
			console.error('Error accessing user media:', error);
			showToastMessage("error", "Failed to access media devices. Please check your permissions.");
		}
	};

	// Stop Capture local media stream
	const stopCaptureAndLeave = () => {
		if (localMediaStream.current && localMediaStream.current.getTracks) {
			localMediaStream.current.getTracks().forEach((track) => {
				track.stop();
			});
		}
		// console.log("stopcapture", roomId);
		socket.current.emit(ACTIONS.LEAVE, { roomId, userId: user.id });
	}

	// Initialize WebRTC and Socket
	useEffect(() => {
		const initializeWebRTC = async () => {
			try {
				//check
				Object.values(connections.current).forEach(connection => connection.close());
				connections.current = {};

				// Initialize socket
				socket.current = socketInit();

				// Event handlers for WebRTC
				const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
					if (!remoteUser) return; // new
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
					if (connections.current[peerId]) {
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

				const setupEventListeners = (connection, peerId, userId) => {
					// Socket event listeners
					socket.current.on(ACTIONS.ADD_PEER, handleNewPeer); // 1
					socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate); //2
					socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP); //3 
					socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer); // 4
					socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => { //5 
						setMute(true, userId);
					});

					socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => { //6
						setMute(false, userId);
					});
					socket.current.on(ACTIONS.USER_NOT_ALLOWED, ({ roomId, user }) => { //7 
						// console.log("user is not in the approved list ");
						setApprovedToJoin(0)
						return;
					})

					socket.current.on(ACTIONS.APPROVE_JOIN_REQUEST, ({ roomId, user }) => { //8
						console.log("a user a requesting to join ur room");
						setJoinRequests(requests => {
							return [...requests, user]
						})
					})

					socket.current.on(ACTIONS.JOIN_APPROVED, ({ roomId }) => { //9 
						stopCaptureAndLeave();
						startCapture()
						initializeWebRTC();
						console.log("user is approved to join the room");
						showToastMessage("success", "Request approved")
						setApprovedToJoin(1)
					})
					socket.current.on(ACTIONS.JOIN_CANCELLED, ({ roomId }) => { // 10 
						// console.log("user is Declined to join the room");
						setApprovedToJoin(false)
					})
					socket.current.on(ACTIONS.JOIN_REQUEST_PENDING, (data) => { //11
						// console.log("user is Declined to join the room");
						// showToastMessage("info", "Request is pending")
						setApprovedToJoin(2)
					})
					socket.current.on(ACTIONS.YOU_ARE_REMOVED, ({ roomId }) => { // 12
						stopCaptureAndLeave();
						showToastMessage("error", "You are removed from the room")
						setApprovedToJoin(0)
					})
				}
				setupEventListeners(connections.current, socket.current, user.id);
				return () => {
					socket.current.off(ACTIONS.ADD_PEER, handleNewPeer); // 1
					socket.current.off(ACTIONS.ICE_CANDIDATE, handleIceCandidate); // 2
					socket.current.off(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP); // 3 
					socket.current.off(ACTIONS.REMOVE_PEER, handleRemovePeer); // 4
					socket.current.off(ACTIONS.MUTE);// 5
					socket.current.off(ACTIONS.UNMUTE);// 6 
					socket.current.off(ACTIONS.USER_NOT_ALLOWED);// 7
					socket.current.off(ACTIONS.APPROVE_JOIN_REQUEST);// 8
					socket.current.off(ACTIONS.JOIN_APPROVED);// 9
					socket.current.off(ACTIONS.JOIN_CANCELLED);// 10
					socket.current.off(ACTIONS.JOIN_REQUEST_PENDING);// 11
					socket.current.off(ACTIONS.YOU_ARE_REMOVED);// 12


				};
			} catch (error) {
				// Handle initialization errors
				console.error('Error initializing WebRTC:', error);
				// You may want to provide user feedback or trigger a fallback mechanism
			}
		};

		initializeWebRTC();
	}, [addNewClient, setClients]);



	useEffect(() => {
		if (approvedToJoin) startCapture();
		return stopCaptureAndLeave;
	}, [approvedToJoin]);

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
				}
				if (isMute === true) socket.current.emit(ACTIONS.MUTE, { roomId, userId });
				else socket.current.emit(ACTIONS.UNMUTE, { roomId, userId });
				settled = true;
			}
			if (settled) clearInterval(interval);
		}, 200);
	};

	return { socket, clients, provideRef, handleMute, approvedToJoin, joinRequests, setJoinRequests };
}
