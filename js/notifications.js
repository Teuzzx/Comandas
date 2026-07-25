/**
 * Sistema de notificações usando Toastify
 */
const Notifications = {
    success(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
                borderRadius: "10px"
            }
        }).showToast();
    },

    error(message) {
        Toastify({
            text: message,
            duration: 4000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                borderRadius: "10px"
            }
        }).showToast();
    },

    warning(message) {
        Toastify({
            text: message,
            duration: 4000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #f39c12, #e67e22)",
                borderRadius: "10px"
            }
        }).showToast();
    },

    info(message) {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: "linear-gradient(to right, #2193b0, #6dd5ed)",
                borderRadius: "10px"
            }
        }).showToast();
    },

    playNotificationSound() {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio play blocked by browser"));
    }
};
