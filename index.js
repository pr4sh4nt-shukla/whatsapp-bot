const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;
  if (body.object === "whatsapp_business_account") {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (message) {
      const from = message.from;
      const text = message.text?.body?.toLowerCase();
      console.log(`Message from ${from}: ${text}`);
      handleMessage(from, text);
    }
  }
  res.sendStatus(200);
});

function handleMessage(to, text) {
  if (text.includes("hello") || text.includes("hi")) {
    sendText(to, "👋 Hello! Welcome. How can I help you?\n\n1️⃣ Services\n2️⃣ Support\n3️⃣ Hours");
  } else if (text === "1" || text.includes("service")) {
    sendText(to, "🛍️ Our Services:\n• Web Design\n• App Development\n• SEO");
  } else if (text === "2" || text.includes("support")) {
    sendText(to, "🛠️ Support team will contact you shortly!");
  } else if (text === "3" || text.includes("hours")) {
    sendText(to, "🕒 Mon–Fri: 9am–6pm\nSat: 10am–2pm\nSun: Closed");
  } else {
    sendText(to, "🤖 Reply *hi* to see the menu.");
  }
}

async function sendText(to, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Send error:", err.response?.data);
  }
}

app.listen(3000, () => console.log("✅ Server running on port 3000"));