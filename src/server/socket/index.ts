import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    // Staff room subscription (e.g. osc-ka-blr-01)
    socket.on('join_osc', (oscId: string) => {
      if (oscId) {
        socket.join(`osc_${oscId}`);
        console.log(`[Socket.IO] Client ${socket.id} joined room osc_${oscId}`);
      }
    });

    // Victim room subscription (by requestReference & trackingToken)
    socket.on('join_request', (requestReference: string) => {
      if (requestReference) {
        socket.join(`request_${requestReference}`);
        console.log(`[Socket.IO] Client ${socket.id} joined room request_${requestReference}`);
      }
    });

    // Chat room subscription (conversationId)
    socket.on('join_conversation', (conversationId: string) => {
      if (conversationId) {
        socket.join(`chat_${conversationId}`);
        console.log(`[Socket.IO] Client ${socket.id} joined room chat_${conversationId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastCapacityChange(oscId: string, capacityData: any) {
  if (!io) return;
  io.to(`osc_${oscId}`).emit('capacity_updated', capacityData);
}

export function broadcastReferralUpdate(oscId: string, referralData: any) {
  if (!io) return;
  io.to(`osc_${oscId}`).emit('referral_updated', referralData);
  if (referralData.requestReference) {
    io.to(`request_${referralData.requestReference}`).emit('request_referral_updated', referralData);
  }
}

export function broadcastNewMessage(conversationId: string, messageData: any) {
  if (!io) return;
  io.to(`chat_${conversationId}`).emit('new_message', messageData);
  io.to(`request_${conversationId}`).emit('new_message', messageData);
}

export function broadcastNotification(recipientId: string, notificationData: any) {
  if (!io) return;
  io.to(`osc_${recipientId}`).emit('notification_received', notificationData);
  io.to(`request_${recipientId}`).emit('notification_received', notificationData);
}

export function broadcastRequestStatus(requestReference: string, statusData: any) {
  if (!io) return;
  io.to(`request_${requestReference}`).emit('status_changed', statusData);
}
