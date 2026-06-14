document.addEventListener("DOMContentLoaded", () => {
    initPlayersPage();
});

async function initPlayersPage() {
    const form = document.getElementById("player-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", handleCreatePlayer);
    await renderPlayers();
}

async function renderPlayers() {
    const playersList = document.getElementById("players-list");
    const emptyMessage = document.getElementById("players-empty");

    if (!playersList) {
        return;
    }

    try {
        const players = await Api.getPlayers();
        playersList.innerHTML = "";

        if (!players || !players.length) {
            showElement(emptyMessage);
            return;
        }

        hideElement(emptyMessage);

        players.forEach(player => {
            const playerElement = createPlayerElement(player);
            playersList.appendChild(playerElement);
        });
    } catch (error) {
        console.error(error);
        showMessage("Failed to load players");
    }
}

async function handleCreatePlayer(event) {
    event.preventDefault();

    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!firstName || !lastName) {
        showMessage("First name and last name are required");
        return;
    }

    try {
        await Api.createPlayer({
            firstName: firstName,
            lastName: lastName
        });

        firstNameInput.value = "";
        lastNameInput.value = "";

        await renderPlayers();
    } catch (error) {
        console.error(error);
        showMessage(error.message);
    }
}

function createPlayerElement(player) {
    const item = document.createElement("div");
    item.className = "player-item";
    item.textContent = getPlayerFullName(player);

    return item;
}

function getPlayerFullName(player) {
    return `${player.firstName} ${player.lastName}`;
}

function showElement(element) {
    if (element) {
        element.hidden = false;
    }
}

function hideElement(element) {
    if (element) {
        element.hidden = true;
    }
}

function showMessage(message) {
    alert(message);
}