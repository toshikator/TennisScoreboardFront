let playersByIdPromise = null;

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById(
        "matches-search-form"
    );

    if (!searchForm) {
        return;
    }

    searchForm.addEventListener(
        "submit",
        handleSearch
    );

    loadAndRenderMatches();
});

async function handleSearch(event) {
    event.preventDefault();

    const firstName = document
        .getElementById("first-name-search")
        .value
        .trim();

    const lastName = document
        .getElementById("last-name-search")
        .value
        .trim();

    await loadAndRenderMatches(
        firstName,
        lastName
    );
}

async function loadAndRenderMatches(
    firstName = "",
    lastName = ""
) {
    const matchesList = document.getElementById(
        "matches-list"
    );

    const emptyMessage = document.getElementById(
        "matches-empty"
    );

    const searchButton = document.getElementById(
        "matches-search-button"
    );

    matchesList.replaceChildren();

    emptyMessage.hidden = true;
    searchButton.disabled = true;

    showStatus("Loading matches...");

    try {
        const [matches, playersById] =
            await Promise.all([
                Api.getMatchesByPlayer(
                    firstName,
                    lastName
                ),

                getPlayersById()
            ]);

        if (!Array.isArray(matches)) {
            throw new Error(
                "Unexpected matches response from server"
            );
        }

        if (matches.length === 0) {
            emptyMessage.hidden = false;
            showStatus("");

            return;
        }

        const fragment =
            document.createDocumentFragment();

        for (const match of matches) {
            const matchElement =
                createMatchElement(
                    match,
                    playersById
                );

            fragment.appendChild(
                matchElement
            );
        }

        matchesList.appendChild(fragment);

        showStatus("");
    } catch (error) {
        console.error(
            "Failed to load finished matches",
            error
        );

        showStatus(
            error.message ||
            "Failed to load finished matches"
        );
    } finally {
        searchButton.disabled = false;
    }
}

async function getPlayersById() {
    if (!playersByIdPromise) {
        playersByIdPromise = Api.getPlayers()
            .then(players => {
                if (!Array.isArray(players)) {
                    throw new Error(
                        "Unexpected players response from server"
                    );
                }

                return new Map(
                    players.map(player => [
                        String(player.id),
                        player
                    ])
                );
            })
            .catch(error => {
                playersByIdPromise = null;

                throw error;
            });
    }

    return playersByIdPromise;
}

function createMatchElement(
    match,
    playersById
) {
    const player1Id =
        match.player1 ?? match.player1Id;

    const player2Id =
        match.player2 ?? match.player2Id;

    const winnerId =
        match.winner ?? match.winnerId;

    const player1 = playersById.get(
        String(player1Id)
    );

    const player2 = playersById.get(
        String(player2Id)
    );

    const player1Name = getPlayerName(
        player1,
        player1Id
    );

    const player2Name = getPlayerName(
        player2,
        player2Id
    );

    const winnerName = getWinnerName(
        winnerId,
        player1Id,
        player2Id,
        player1Name,
        player2Name
    );

    const matchElement =
        document.createElement("article");

    matchElement.className =
        "player-item match-item";

    const playersElement =
        document.createElement("strong");

    playersElement.textContent =
        `${player1Name} vs ${player2Name}`;

    const winnerElement =
        document.createElement("p");

    winnerElement.textContent =
        `Winner: ${winnerName}`;

    matchElement.append(
        playersElement,
        winnerElement
    );

    return matchElement;
}

function getPlayerName(
    player,
    playerId
) {
    if (!player) {
        return `Player #${playerId}`;
    }

    return (
        `${player.firstName} ${player.lastName}`
    ).trim();
}

function getWinnerName(
    winnerId,
    player1Id,
    player2Id,
    player1Name,
    player2Name
) {
    if (
        String(winnerId) ===
        String(player1Id)
    ) {
        return player1Name;
    }

    if (
        String(winnerId) ===
        String(player2Id)
    ) {
        return player2Name;
    }

    return `Player #${winnerId}`;
}

function showStatus(message) {
    const statusElement =
        document.getElementById(
            "matches-status"
        );

    if (statusElement) {
        statusElement.textContent = message;
    }
}