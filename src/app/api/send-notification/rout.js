// src/app/api/send-notification/route.js
import admin from "firebase-admin";
import serviceAccount from "@/../firebase.json"; // 경로 주의

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export async function POST(request) {
    try {
        const { token, title, body, data } = await request.json();

        const message = {
            notification: { title, body },
            data: data || {},
            token, // 클라이언트 FCM 토큰
        };

        const response = await admin.messaging().send(message);
        return new Response(JSON.stringify({ success: true, response }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
