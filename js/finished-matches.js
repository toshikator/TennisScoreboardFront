const playerCache = new Map();

document.addEventListener("DOMContentLoaded", initFinishedMatchesPage);

async function initFinishedMatchesPage() {
    const searchForm = document.getElementById("matches-search-form");

    if (!searchForm) {
        return;
    }

    searchForm.addEventListener("submit", handleMatchesSearch);

    await renderMatches();
}

async function handleMatchesSearch(event) {
    event.preventDefault();

    const firstName = document
        .getElementById("first-name-search")
        .value
        .trim();

    const lastName = document
        .getElementById("last-name-search")
        .value
        .trim();

    await renderMatches(firstName, lastName);
}

async function renderMatches(firstName = "", lastName = "") {
    const matchesList = document.getElementById("matches-list");
    const emptyMessage = document.getElementById("matches-empty");

    if (!matchesList || !emptyMessage) {
        return;
    }

    matchesList.replaceChildren();
    emptyMessage.hidden = true;

    showStatus("Loading matches...");

    try {
        const matches = await Api.getMatchesByPlayer(
            firstName,
            lastName
        );

        if (!Array.isArray(matches)) {
            throw new Error(
                "The server returned an unexpected matches response."
            );
        }

        if (matches.length === 0) {
            showStatus("");
            emptyMessage.hidden = false;
            return;
        }

        const matchElements = await Promise.all(
            matches.map(match => createMatchElement(match))
        );

        matchesList.append(...matchElements);

        showStatus("");
    } catch (error) {
        console.error(
            "Failed to load finished matches",
            error
        );

        showStatus(
            error.message || "Failed to load finished matches."
        );
    }
}

async function createMatchElement(match) {
    /*
     * Current backend fields:
     * player1, player2, winner.
     *
     * player1Id, player2Id and winnerId are retained
     * as fallbacks for compatibility with the previous format.
     */
    const player1Id = match.player1 ?? match.player1Id;
    const player2Id = match.player2 ?? match.player2Id;
    const winnerId = match.winner ?? match.winnerId;

    const [player1, player2] = await Promise.all([
        getPlayer(player1Id),
        getPlayer(player2Id)
    ]);

    const player1Name = getPlayerName(player1);
    const player2Name = getPlayerName(player2);

    const winnerName = getWinnerName(
        winnerId,
        player1Id,
        player2Id,
        player1Name,
        player2Name
    );

    const matchElement = document.createElement("article");
    matchElement.className = "player-item match-item";

    const playersElement = document.createElement("strong");
    playersElement.textContent =
        `${player1Name} vs ${player2Name}`;

    const winnerElement = document.createElement("p");
    winnerElement.textContent = `Winner: ${winnerName}`;

    matchElement.append(
        playersElement,
        winnerElement
    );

    return matchElement;
}

async function getPlayer(playerId) {
    const cacheKey = String(playerId);

    if (!playerCache.has(cacheKey)) {
        const playerRequest = Api.getPlayer(playerId);

        playerCache.set(cacheKey, playerRequest);
    }

    return playerCache.get(cacheKey);
}

function getPlayerName(player) {
    return `${player.firstName} ${player.lastName}`.trim();
}

function getWinnerName(
    winnerId,
    player1Id,
    player2Id,
    player1Name,
    player2Name
) {
    if (String(winnerId) === String(player1Id)) {
        return player1Name;
    }

    if (String(winnerId) === String(player2Id)) {
        return player2Name;
    }

    return "Unknown";
}

function showStatus(message) {
    const statusElement =
        document.getElementById("matches-status");

    if (statusElement) {
        statusElement.textContent = message;
    }
}