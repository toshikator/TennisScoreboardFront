const Api = {
    async getPlayers() {
        return request("/players");
    },

    async createPlayer(player) {
        return request("/players", {
            method: "POST",
            body: player
        });
    },

    async createMatch(match) {
        return request("/matches", {
            method: "POST",
            body: match
        });
    }
};

async function request(path, options = {}) {
    const fetchOptions = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${AppConfig.apiBaseUrl}${path}`, fetchOptions);

    if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function readErrorMessage(response) {
    const text = await response.text();

    if (text) {
        return text;
    }

    return `Request failed with status ${response.status}`;
}