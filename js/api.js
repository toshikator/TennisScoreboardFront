const Api = {
    async getPlayers() {
        return request("/players");
    },

    async getPlayer(id) {
        const params = new URLSearchParams({id: id});
        return request(`/player?${params.toString()}`);
    },

    async createPlayer(player) {
        const params = new URLSearchParams({
            firstName: player.firstName,
            lastName: player.lastName
        });

        return request(`/player?${params.toString()}`, {
            method: "POST"
        });
    },

    async createMatch(match) {
        const params = new URLSearchParams({
            player1Id: match.player1Id,
            player2Id: match.player2Id
        });

        return request(`/new-match?${params.toString()}`, {
            method: "POST"
        });
    },

    async getMatchScore(matchId) {
        const params = new URLSearchParams({
            match_id: matchId
        });

        return request(`/match-score?${params.toString()}`);
    },

    async addPoint(matchId, playerId) {
        const params = new URLSearchParams({
            match_id: matchId,
            player_for_score_id: playerId
        });

        return request(`/match-score?${params.toString()}`, {
            method: "POST"
        });
    },

    async getMatches() {
        return request("/matches");
    },

    async getMatchesByPlayer(
        firstName,
        lastName,
        page = 1,
        limit = 6
    ) {
        const params = new URLSearchParams();
        const hasFilter = Boolean(firstName || lastName);

        if (firstName) {
            params.append("firstName", firstName);
        }

        if (lastName) {
            params.append("lastName", lastName);
        }

        if (!hasFilter) {
            params.append("page", String(page));
            params.append("limit", String(limit));
        }

        const query = params.toString();

        return request(
            query
                ? `/matches?${query}`
                : "/matches"
        );
    }
};

async function request(path, options = {}) {
    const fetchOptions = {
        method: options.method || "GET",
        headers: {
            "Accept": "application/json"
        }
    };

    const response = await fetch(
        `${AppConfig.apiBaseUrl}${path}`,
        fetchOptions
    );

    if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        throw new Error(errorMessage);
    }

    return readResponseBody(response);
}

async function readResponseBody(response) {
    if (response.status === 204) {
        return null;
    }

    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
}

async function readErrorMessage(response) {
    const text = await response.text();

    if (text) {
        try {
            const body = JSON.parse(text);
            return body.message || text;
        } catch (error) {
            return text;
        }
    }

    return `Request failed with status ${response.status}`;
}