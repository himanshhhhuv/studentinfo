import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Add DELETE handler
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    const auth = getAuth();
    await auth.deleteUser(userId);
    return new Response(JSON.stringify({ message: 'User deleted successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), { status: 500 });
  }
}

// Optionally, retain the POST handler if needed
export async function POST(req: Request) {
  // Handle POST requests if necessary
}
