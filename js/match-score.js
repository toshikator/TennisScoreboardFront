document.addEventListener("DOMContentLoaded", () => {
    initMatchScorePage();
});

async function initMatchScorePage() {
    const matchId = getMatchIdFromUrl();

    if (!matchId) {
        showError("Match id is missing");
        return;
    }

    await loadInitialMatchScore(matchId);
}

function getMatchIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("match_id");
}

async function loadInitialMatchScore(matchId) {
    try {
        const matchScore = await Api.getMatchScore(matchId);

        renderMatch(matchScore);
        bindScoreButtons(matchId, matchScore);
        showMatchContainer();
    } catch (error) {
        console.error(error);
        showError(error.message);
    }
}

function renderMatch(matchScore) {
    setText(
        "player1-name",
        getPlayerFullName(matchScore.player1Firstname, matchScore.player1Lastname)
    );

    setText(
        "player2-name",
        getPlayerFullName(matchScore.player2Firstname, matchScore.player2Lastname)
    );

    setText("player1-sets", matchScore.player1Set);
    setText("player2-sets", matchScore.player2Set);

    setText("player1-games", matchScore.player1Game);
    setText("player2-games", matchScore.player2Game);

    setText("player1-points", matchScore.player1Score);
    setText("player2-points", matchScore.player2Score);

    renderMatchStatus(matchScore);
}

function renderMatchStatus(matchScore) {
    if (matchScore.isFinished) {
        setText("match-status", "Match is finished");
        setText("match-winner", getWinnerText(matchScore));
        disableScoreButtons();
        return;
    }

    setText("match-status", "Match is in progress");
    setText("match-winner", "");
    enableScoreButtons();
}

function getWinnerText(matchScore) {
    const winnerId = Number(matchScore.winnerId);

    if (winnerId === Number(matchScore.player1Id)) {
        return `Winner: ${getPlayerFullName(
            matchScore.player1Firstname,
            matchScore.player1Lastname
        )}`;
    }

    if (winnerId === Number(matchScore.player2Id)) {
        return `Winner: ${getPlayerFullName(
            matchScore.player2Firstname,
            matchScore.player2Lastname
        )}`;
    }

    return "Winner: unknown";
}

function bindScoreButtons(matchId, matchScore) {
    const player1Button = document.getElementById("player1-score-button");
    const player2Button = document.getElementById("player2-score-button");

    if (player1Button) {
        player1Button.onclick = async () => {
            await addPointAndRenderResponse(matchId, matchScore.player1Id);
        };
    }

    if (player2Button) {
        player2Button.onclick = async () => {
            await addPointAndRenderResponse(matchId, matchScore.player2Id);
        };
    }
}

async function addPointAndRenderResponse(matchId, playerId) {
    disableScoreButtons();

    try {
        const updatedMatchScore = await Api.addPoint(matchId, playerId);

        renderMatch(updatedMatchScore);
        showMatchContainer();

        if (!updatedMatchScore.isFinished) {
            enableScoreButtons();
        }
    } catch (error) {
        console.error(error);
        showError(error.message);
    }
}

function enableScoreButtons() {
    const player1Button = document.getElementById("player1-score-button");
    const player2Button = document.getElementById("player2-score-button");

    if (player1Button) {
        player1Button.disabled = false;
    }

    if (player2Button) {
        player2Button.disabled = false;
    }
}

function disableScoreButtons() {
    const player1Button = document.getElementById("player1-score-button");
    const player2Button = document.getElementById("player2-score-button");

    if (player1Button) {
        player1Button.disabled = true;
    }

    if (player2Button) {
        player2Button.disabled = true;
    }
}

function showMatchContainer() {
    const container = document.getElementById("match-score-container");
    const error = document.getElementById("match-score-error");

    if (container) {
        container.hidden = false;
    }

    if (error) {
        error.hidden = true;
    }
}

function showError(message) {
    const error = document.getElementById("match-score-error");
    const container = document.getElementById("match-score-container");

    if (error) {
        error.textContent = message;
        error.hidden = false;
    }

    if (container) {
        container.hidden = true;
    }
}

function setText(elementId, text) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = text ?? "";
    }
}

function getPlayerFullName(firstName, lastName) {
    return `${firstName} ${lastName}`;
}