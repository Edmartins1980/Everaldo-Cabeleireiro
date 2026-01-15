"use server"

// Resend Removed as requested.
// This function now only serves as a placeholder or can be extended for other server-side notifications (like Logs or SMS in future)

interface BookingDetails {
    customerName: string
    serviceName: string
    date: string // ISO string or date object
    time: string
}

export async function sendPushNotification(details: BookingDetails) {
    const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "b990cc83-c3e9-489c-8572-91788099673b"
    const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
        },
        body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            target_channel: "push",
            filters: [
                { "field": "tag", "key": "role", "relation": "=", "value": "admin" }
            ],
            headings: { "en": "Novo Agendamento! ✂️", "pt": "Novo Agendamento! ✂️" },
            contents: { "en": `O cliente ${details.customerName} agendou para às ${details.time}`, "pt": `O cliente ${details.customerName} agendou para às ${details.time}` }
        })
    };

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', options);
        const data = await response.json();
        console.log("OneSignal Push Result:", data);
        return { success: true, data };
    } catch (err) {
        console.error("OneSignal Push Error:", err);
        return { success: false, error: err };
    }
}

export async function sendBookingNotification(details: BookingDetails) {
    // Email sending logic removed to prevent "Missing API Key" errors.
    // The system now relies 100% on the WhatsApp redirect on the client side.

    console.log("Booking Notification (Server Side Log):", details)

    return { success: true }
}
