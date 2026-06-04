document.addEventListener("DOMContentLoaded", () => {
    initNewMatchPage();
});

async function initNewMatchPage() {
    const form = document.getElementById("new-match-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", handleCreateMatch);

    await fillPlayersSelects();
}

async function fillPlayersSelects() {
    const player1Select = document.getElementById("player1");
    const player2Select = document.getElementById("player2");

    if (!player1Select || !player2Select) {
        return;
    }

    try {
        const players = await Api.getPlayers();

        fillSelect(player1Select, players, "Choose player 1");
        fillSelect(player2Select, players, "Choose player 2");
    } catch (error) {
        console.error(error);
        showMessage("Failed to load players");
    }
}

function fillSelect(select, players, placeholderText) {
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = placeholderText;
    placeholder.disabled = true;
    placeholder.selected = true;

    select.appendChild(placeholder);

    players.forEach(player => {
        const option = document.createElement("option");

        option.value = player.id;
        option.textContent = getPlayerFullName(player);

        select.appendChild(option);
    });
}

async function handleCreateMatch(event) {
    event.preventDefault();

    const player1Select = document.getElementById("player1");
    const player2Select = document.getElementById("player2");

    const player1Id = Number(player1Select.value);
    const player2Id = Number(player2Select.value);

    if (!player1Id || !player2Id) {
        showMessage("Choose both players");
        return;
    }

    if (player1Id === player2Id) {
        showMessage("Players must be different");
        return;
    }

    try {
        const createdMatch = await Api.createMatch({
            player1Id: player1Id,
            player2Id: player2Id
        });

        window.location.href = `match-score.html?match_id=${createdMatch.matchId}`;
    } catch (error) {
        console.error(error);
        showMessage(error.message);
    }
}

function getPlayerFullName(player) {
    return `${player.firstName} ${player.lastName}`;
}

function showMessage(message) {
    alert(message);
}