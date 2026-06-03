document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    loadFooter();
});

function getBasePath() {
    return window.location.pathname.includes("/html/") ? "../" : "";
}

async function loadHeader() {
    const headerContainer = document.getElementById("site-header");

    if (!headerContainer) {
        return;
    }

    const basePath = getBasePath();
    const response = await fetch(`${basePath}html/header.html`);

    if (!response.ok) {
        console.error("Failed to load header");
        return;
    }

    headerContainer.outerHTML = await response.text();

    updateHeaderLinks(basePath);
}

async function loadFooter() {
    const footerContainer = document.getElementById("site-footer");

    if (!footerContainer) {
        return;
    }

    const basePath = getBasePath();
    const response = await fetch(`${basePath}html/footer.html`);

    if (!response.ok) {
        console.error("Failed to load footer");
        return;
    }

    footerContainer.outerHTML = await response.text();

    updateFooterInfo();
}

function updateHeaderLinks(basePath) {
    const logo = document.querySelector(".logo");
    const homeLink = document.getElementById("action-home");
    const newMatchLink = document.getElementById("action-new-match");
    const playersLink = document.getElementById("action-new-player");
    const finishedMatchesLink = document.getElementById("action-finished");

    if (logo) {
        logo.src = `${basePath}images/logo.png`;
    }

    if (homeLink) {
        homeLink.href = `${basePath}index.html`;
    }

    if (newMatchLink) {
        newMatchLink.href = `${basePath}html/new-match.html`;
    }

    if (playersLink) {
        playersLink.href = `${basePath}html/players.html`;
    }

    if (finishedMatchesLink) {
        finishedMatchesLink.href = `${basePath}html/finishedMatches.html`;
    }
}

function updateFooterInfo() {
    const yearElement = document.getElementById("year");
    const dateTimeElement = document.getElementById("date-time");
    const timezoneElement = document.getElementById("timezone");

    const now = new Date();

    if (yearElement) {
        yearElement.textContent = now.getFullYear();
    }

    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString();
    }

    if (timezoneElement) {
        timezoneElement.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}