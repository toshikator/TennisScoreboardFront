document.addEventListener("DOMContentLoaded", () => {
    initFinishedMatchesPage();
});

async function initFinishedMatchesPage() {
    const matchesSearchForm = document.getElementById("matches-search-form");
    if (!matchesSearchForm) {
        return;
    }
    matchesSearchForm.addEventListener("submit", handleGetMatches);
    await renderMatches();
}

async function renderMatches() {
    const matchesList = document.getElementById("matches-list");
    const emptyMessage = document.getElementById("matches-empty-state");
    const firstNameInput = document.getElementById("first-name-search");
    const lastNameInput = document.getElementById("last-name-search");

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!matchesList) {
        return;
    }

    try {
        const matches = await Api.getMatchesByPlayer(firstName, lastName);

        matchesList.innerHTML = "";

        if (!matches || !matches.length) {
            showElement(emptyMessage);
            return;
        }

        hideElement(emptyMessage);

        matches.forEach(match => {
            const playerElement = createMatchElement(match);
            matchesList.appendChild(playerElement);
        });
    } catch (error) {
        console.error(error);
        showMessage("Failed to load players");
    }
}

async function handleGetMatches(event) {
    event.preventDefault();

    const firstNameInput = document.getElementById("first-name-search");
    const lastNameInput = document.getElementById("last-name-search");

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!firstName && !lastName) {
        showMessage("At least first name or last name is required");
        return;
    }

    try {
        await Api.getMatchesByPlayer({
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

function createMatchElement(match) {
    const item = document.createElement("div");
    item.className = "match-item";
    item.textContent = getMatchInfo(match);

    return item;
}

function getMatchInfo(match) {
    const player1 = Api.getPlayer(match.player1Id);
    const player2 = Api.getPlayer(match.player2Id);
    const winner = match.winner === player1 ? player1 : player2;
    return `${player1.firstName} ${player2.firstName}`;
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