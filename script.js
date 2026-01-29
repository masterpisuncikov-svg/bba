// === КОНФИГУРАЦИЯ ===
// ЗАМЕНИТЕ ЭТОТ URL на ваш Replit/Glitch сервер
const SERVER_URL = "https://ваш-сервер.ваш-ник.repl.co";
// ====================

// Элементы DOM
const statusElement = document.getElementById('status');
const serverUrlElement = document.getElementById('serverUrl');
let lastStatusCheck = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    serverUrlElement.textContent = SERVER_URL || "Не указан";
    checkServerStatus();
});

// Проверка статуса сервера
async function checkServerStatus() {
    if (!SERVER_URL || SERVER_URL.includes("ваш-сервер")) {
        showStatus("❌ URL сервера не настроен. Откройте script.js и укажите ваш URL Replit/Glitch", "error");
        return;
    }
    
    showStatus("🔍 Проверяю соединение с сервером...", "loading");
    
    try {
        const response = await fetch(`${SERVER_URL}/status`);
        if (response.ok) {
            const data = await response.json();
            showStatus(`✅ Сервер работает!<br>Игроков: ${data.players || 0}<br>Время: ${new Date().toLocaleTimeString()}`, "success");
            lastStatusCheck = new Date();
        } else {
            showStatus("❌ Сервер не отвечает (ошибка HTTP)", "error");
        }
    } catch (error) {
        showStatus(`❌ Ошибка подключения: ${error.message}`, "error");
        console.error("Ошибка проверки сервера:", error);
    }
}

// Отправить команду
async function sendCommand(action, value) {
    const playerId = document.getElementById('playerId').value;
    
    if (!playerId) {
        showStatus("⚠️ Введите Player ID", "error");
        return;
    }
    
    showStatus(`📤 Отправка команды: ${action}=${value} для игрока ${playerId}...`, "loading");
    
    try {
        const response = await fetch(`${SERVER_URL}/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerId: playerId,
                action: action,
                value: value,
                timestamp: Date.now()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatus(`✅ Команда отправлена!<br>ID: ${data.commandId}<br>Ожидайте выполнения в игре`, "success");
            // Автоматически проверяем статус через 2 секунды
            setTimeout(checkServerStatus, 2000);
        } else {
            showStatus(`❌ Ошибка: ${data.message || "Неизвестная ошибка"}`, "error");
        }
    } catch (error) {
        showStatus(`❌ Ошибка отправки: ${error.message}`, "error");
        console.error("Ошибка отправки команды:", error);
    }
}

// Отправить кастомную команду
function sendCustomCommand() {
    const action = document.getElementById('customAction').value;
    const value = document.getElementById('customValue').value;
    
    if (!action) {
        showStatus("⚠️ Введите название команды", "error");
        return;
    }
    
    sendCommand(action, value);
}

// Показать статус
function showStatus(message, type = "") {
    statusElement.innerHTML = `<p class="${type}">${message}</p>`;
}

// Периодическая проверка статуса (каждые 30 секунд)
setInterval(() => {
    if (lastStatusCheck && (Date.now() - lastStatusCheck) > 30000) {
        checkServerStatus();
    }
}, 30000);
