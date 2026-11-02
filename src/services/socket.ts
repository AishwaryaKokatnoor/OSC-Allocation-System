import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected successfully:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Client] Disconnected.');
    });
  }

  return socket;
}

export function subscribeToOSC(oscId: string) {
  const s = getSocket();
  s.emit('join_osc', oscId);
}

export function subscribeToRequest(requestReference: string) {
  const s = getSocket();
  s.emit('join_request', requestReference);
  s.emit('join_conversation', requestReference);
}
