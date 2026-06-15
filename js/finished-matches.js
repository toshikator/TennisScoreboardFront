let playersByIdPromise = null;
let requestVersion = 0;
let elements = null;

const state = {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
    firstName: "",
    lastName: "",
    loading: false
};

document.addEventListener("DOMContentLoaded", () => {
    elements = {
        searchForm: document.getElementById(
            "matches-search-form"
        ),
        firstNameInput: document.getElementById(
            "first-name-search"
        ),
        lastNameInput: document.getElementById(
            "last-name-search"
        ),
        searchButton: document.getElementById(
            "matches-search-button"
        ),
        toolbar: document.getElementById(
            "matches-toolbar"
        ),
        pageSize: document.getElementById(
            "matches-page-size"
        ),
        status: document.getElementById(
            "matches-status"
        ),
        list: document.getElementById(
            "matches-list"
        ),
        empty: document.getElementById(
            "matches-empty"
        ),
        pagination: document.getElementById(
            "matches-pagination"
        ),
        paginationSummary: document.getElementById(
            "pagination-summary"
        ),
        paginationPages: document.getElementById(
            "pagination-pages"
        ),
        firstPage: document.getElementById(
            "pagination-first"
        ),
        previousPage: document.getElementById(
            "pagination-previous"
        ),
        nextPage: document.getElementById(
            "pagination-next"
        ),
        lastPage: document.getElementById(
            "pagination-last"
        )
    };

    if (!elements.searchForm || !elements.pageSize) {
        return;
    }

    state.limit = Number(elements.pageSize.value);

    elements.searchForm.addEventListener(
        "submit",
        handleSearch
    );

    elements.pageSize.addEventListener(
        "change",
        handlePageSizeChange
    );

    elements.firstPage.addEventListener(
        "click",
        () => changePage(1)
    );

    elements.previousPage.addEventListener(
        "click",
        () => changePage(state.page - 1)
    );

    elements.nextPage.addEventListener(
        "click",
        () => changePage(state.page + 1)
    );

    elements.lastPage.addEventListener(
        "click",
        () => changePage(state.totalPages)
    );

    updatePaginationMode();
    loadMatches();
});

function handleSearch(event) {
    event.preventDefault();

    state.firstName =
        elements.firstNameInput.value.trim();

    state.lastName =
        elements.lastNameInput.value.trim();

    state.page = 1;

    updatePaginationMode();
    loadMatches();
}

function handlePageSizeChange() {
    if (hasActiveFilter()) {
        return;
    }

    const newLimit = Number(
        elements.pageSize.value
    );

    if (![6, 12, 24].includes(newLimit)) {
        return;
    }

    state.limit = newLimit;
    state.page = 1;

    loadMatches();
}

function changePage(page) {
    if (
        hasActiveFilter() ||
        state.loading ||
        !Number.isInteger(page) ||
        page < 1 ||
        page > state.totalPages ||
        page === state.page
    ) {
        return;
    }

    state.page = page;
    loadMatches(true);
}

async function loadMatches(scrollToList = false) {
    const currentRequest = ++requestVersion;
    const filtered = hasActiveFilter();

    elements.list.replaceChildren();
    elements.empty.hidden = true;

    setLoading(true);
    showStatus("Loading matches...");

    try {
        const [response, playersById] =
            await Promise.all([
                Api.getMatchesByPlayer(
                    state.firstName,
                    state.lastName,
                    state.page,
                    state.limit
                ),
                getPlayersById()
            ]);

        if (currentRequest !== requestVersion) {
            return;
        }

        const result = filtered
            ? normalizeFilteredResponse(response)
            : normalizePaginatedResponse(
                response,
                state.page,
                state.limit
            );

        state.page = result.page;
        state.limit = result.limit;
        state.total = result.total;
        state.totalPages = result.totalPages;

        if (
            !filtered &&
            state.total > 0 &&
            result.items.length === 0 &&
            state.page > state.totalPages
        ) {
            state.page = state.totalPages;

            await loadMatches(scrollToList);
            return;
        }

        renderMatches(
            result.items,
            playersById
        );

        showStatus(
            createResultsStatus(
                result,
                filtered
            )
        );

        if (scrollToList) {
            elements.list.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    } catch (error) {
        if (currentRequest !== requestVersion) {
            return;
        }

        console.error(
            "Failed to load finished matches",
            error
        );

        state.total = 0;
        state.totalPages = 0;

        showStatus(
            error.message ||
            "Failed to load finished matches"
        );
    } finally {
        if (currentRequest === requestVersion) {
            setLoading(false);
            renderPagination();
        }
    }
}

function normalizeFilteredResponse(response) {
    if (!Array.isArray(response)) {
        throw new Error(
            "Unexpected filtered matches response from server"
        );
    }

    return {
        items: response,
        page: 1,
        limit: state.limit,
        total: response.length,
        totalPages: 0
    };
}

function normalizePaginatedResponse(
    response,
    requestedPage,
    requestedLimit
) {
    if (
        !response ||
        !Array.isArray(response.items) ||
        !response.pagination
    ) {
        throw new Error(
            "Unexpected paginated matches response from server"
        );
    }

    const page = positiveInteger(
        response.pagination.page,
        requestedPage
    );

    const limit = positiveInteger(
        response.pagination.limit,
        requestedLimit
    );

    const total = nonNegativeInteger(
        response.pagination.total,
        0
    );

    return {
        items: response.items,
        page,
        limit,
        total,
        totalPages:
            total === 0
                ? 0
                : Math.ceil(total / limit)
    };
}

function renderMatches(matches, playersById) {
    elements.list.replaceChildren();
    elements.empty.hidden = matches.length !== 0;

    if (matches.length === 0) {
        return;
    }

    const fragment =
        document.createDocumentFragment();

    for (const match of matches) {
        fragment.appendChild(
            createMatchElement(
                match,
                playersById
            )
        );
    }

    elements.list.appendChild(fragment);
}

function updatePaginationMode() {
    const filtered = hasActiveFilter();

    elements.toolbar.hidden = filtered;

    if (filtered) {
        elements.pagination.hidden = true;
        elements.paginationSummary.textContent = "";
        elements.paginationPages.replaceChildren();
    }
}

function renderPagination() {
    elements.paginationPages.replaceChildren();

    if (
        hasActiveFilter() ||
        state.totalPages === 0
    ) {
        elements.pagination.hidden = true;
        elements.paginationSummary.textContent = "";
        return;
    }

    elements.pagination.hidden = false;

    elements.paginationSummary.textContent =
        `Page ${state.page} of ${state.totalPages}`;

    const firstPageReached =
        state.page === 1;

    const lastPageReached =
        state.page === state.totalPages;

    elements.firstPage.disabled =
        state.loading || firstPageReached;

    elements.previousPage.disabled =
        state.loading || firstPageReached;

    elements.nextPage.disabled =
        state.loading || lastPageReached;

    elements.lastPage.disabled =
        state.loading || lastPageReached;

    for (const page of getVisiblePages()) {
        const button =
            document.createElement("button");

        const isCurrentPage =
            page === state.page;

        button.type = "button";
        button.className = "pagination-page";
        button.textContent = String(page);
        button.disabled =
            state.loading || isCurrentPage;

        button.setAttribute(
            "aria-label",
            `Go to page ${page}`
        );

        if (isCurrentPage) {
            button.classList.add("is-active");

            button.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            button.addEventListener(
                "click",
                () => changePage(page)
            );
        }

        elements.paginationPages.appendChild(
            button
        );
    }
}

function getVisiblePages() {
    const visibleCount = 5;

    if (state.totalPages <= visibleCount) {
        return createNumberRange(
            1,
            state.totalPages
        );
    }

    let start = Math.max(
        1,
        state.page - 2
    );

    let end = Math.min(
        state.totalPages,
        start + visibleCount - 1
    );

    if (end - start + 1 < visibleCount) {
        start = end - visibleCount + 1;
    }

    return createNumberRange(start, end);
}

function createNumberRange(start, end) {
    return Array.from(
        {
            length: end - start + 1
        },
        (_, index) => start + index
    );
}

function createResultsStatus(
    result,
    filtered
) {
    if (result.total === 0) {
        return "";
    }

    if (filtered) {
        return `Found matches: ${result.total}.`;
    }

    const first =
        (result.page - 1) *
        result.limit +
        1;

    const last = Math.min(
        first + result.items.length - 1,
        result.total
    );

    return `Showing matches ${first}–${last} of ${result.total}.`;
}

function hasActiveFilter() {
    return Boolean(
        state.firstName ||
        state.lastName
    );
}

function setLoading(loading) {
    state.loading = loading;

    elements.searchButton.disabled = loading;

    elements.pageSize.disabled =
        loading || hasActiveFilter();

    renderPagination();
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

    const player1Name = getPlayerName(
        playersById.get(String(player1Id)),
        player1Id
    );

    const player2Name = getPlayerName(
        playersById.get(String(player2Id)),
        player2Id
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
        `Winner: ${getWinnerName(
            winnerId,
            player1Id,
            player2Id,
            player1Name,
            player2Name
        )}`;

    matchElement.append(
        playersElement,
        winnerElement
    );

    return matchElement;
}

function getPlayerName(player, playerId) {
    if (!player) {
        return `Player #${playerId}`;
    }

    return `${player.firstName} ${player.lastName}`
        .trim();
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

    return `Player #${winnerId}`;
}

function positiveInteger(value, fallback) {
    const number = Number(value);

    return Number.isInteger(number) &&
    number > 0
        ? number
        : fallback;
}

function nonNegativeInteger(value, fallback) {
    const number = Number(value);

    return Number.isInteger(number) &&
    number >= 0
        ? number
        : fallback;
}

function showStatus(message) {
    elements.status.textContent = message;
}