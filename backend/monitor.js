const axios = require("axios");

const BACKEND_URL = "https://patient-record-app-drly.onrender.com";

async function checkHealth() {
    try {
        const response = await axios.get(`${BACKEND_URL}/health`, {
            timeout: 10000
        });

        if (response.status === 200) {
            console.log("✅ Backend Healthy");
        } else {
            throw new Error("Unexpected response");
        }

    } catch (error) {
        console.error("❌ Backend Down:", error.message);
    }
}

checkHealth();