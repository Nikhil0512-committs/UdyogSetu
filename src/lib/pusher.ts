import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance (used in API routes and Server Actions)
// We only initialize this if we have the credentials to prevent crashes on startup.
export const pusherServer = process.env.PUSHER_APP_ID 
  ? new PusherServer({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2', // Defaulting to Asia Pacific (Mumbai) for India
      useTLS: true,
    }) 
  : null;

// Client-side instance builder (used in React components)
// We wrap it in a function so it's not instantiated during SSR if we don't need it.
export const getPusherClient = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) {
    return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    });
  }
  return null;
};
