// === КОНФИГУРАЦИЯ ===
const SERVER_URL = "https://early-hopeful-characters--masterpisunciko.replit.app";  // без слеша в конце
// ====================

const statusElement = document.getElementById('status');
const serverUrlElement = document.getElementById('serverUrl');
const playerIdInput = document.getElementById('playerId');
let lastStatusCheck = null;
let isSending = false; // защита от спама

document.addEventListener('DOMContentLoaded', () => {
    serverUrlElement.textContent = SERVER_URL;
    checkServerStatus();
    setInterval(checkServerStatusIfNeeded, 30000);
});

async function checkServerStatus() {
    if (!SERVER_URL) {
        showStatus("❌ URL сервера не указан в script.js", "error");
        return;
    }

    showStatus("🔍 Проверка сервера...", "loading");

    try {
        const res = await fetch(`${SERVER_URL}/status`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        showStatus(
            `✅ Сервер онлайн<br>` +
            `Игроков онлайн: ${data.playersOnline || 0}<br>` +
            `Ожидающих команд: ${data.pendingCommands || 0}<br>` +
            `Время: ${new Date(data.timestamp).toLocaleString()}`,
            "success"
        );
        lastStatusCheck = Date.now();
    } catch (err) {
        showStatus(`❌ Нет связи с сервером<br>${err.message}`, "error");
        console.error(err);
    }
}

function checkServerStatusIfNeeded() {
    if (!lastStatusCheck || Date.now() - lastStatusCheck > 45000) {
        checkServerStatus();
    }
}

async function sendCommand(action, value = null) {
    if (isSending) return;
    isSending = true;

    const playerIdRaw = playerIdInput.value.trim();
    if (!playerIdRaw) {
        showStatus("⚠️ Введите Player ID / UserId", "error");
        isSending = false;
        return;
    }

    const playerId = String(playerIdRaw); // всегда строка

    showStatus(`📤 Отправка: ${action} → ${playerId} ...`, "loading");

    try {
        const res = await fetch(`${SERVER_URL}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId,
                action,
                value,          // может быть string, number, object
                timestamp: Date.now()
            })
        });

        const data = await res.json();

        if (data.success) {
            showStatus(
                `✅ Успех!<br>Команда: ${action}<br>ID: ${data.commandId}<br>Для игрока: ${playerId}`,
                "success"
            );
            setTimeout(checkServerStatus, 1500);
        } else {
            showStatus(`❌ Ошибка: ${data.error || data.message || "неизвестно"}`, "error");
        }
    } catch (err) {
        showStatus(`❌ Ошибка сети: ${err.message}`, "error");
        console.error(err);
    } finally {
        isSending = false;
    }
}

function sendCustomCommand() {
    const action = document.getElementById('customAction').value.trim();
    let value = document.getElementById('customValue').value.trim();

    if (!action) {
        showStatus("⚠️ Введите название команды (action)", "error");
        return;
    }

    // Пытаемся распарсить value как JSON, если выглядит как объект
    try {
        if (value.startsWith('{') || value.startsWith('[')) {
            value = JSON.parse(value);
        }
    } catch {}

    sendCommand(action, value || null);
}

function showStatus(message, type = "") {
    statusElement.innerHTML = `<p class="${type}">${message}</p>`;
}
