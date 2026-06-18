# Tennis Scoreboard Frontend

![HTML5](https://img.shields.io/badge/HTML5-Markup-E34F26?logo=html5\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styles-1572B6?logo=css3\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript\&logoColor=black)

Frontend application for the Tennis Scoreboard project.

The application provides a browser interface for creating players, starting tennis matches, updating live scores, and browsing completed matches.

**Backend repository:**
[github.com/toshikator/tennis_scoreboard](https://github.com/toshikator/tennis_scoreboard)

## About the Project

Tennis Scoreboard Frontend is a client-side web application built with plain HTML, CSS, and JavaScript.

The project does not use a frontend framework or external JavaScript libraries. It communicates with the separate Tennis Scoreboard backend through HTTP requests and renders the returned data in the browser.

The frontend is responsible for:

* displaying the main application navigation;
* creating and listing players;
* selecting players for a new match;
* creating matches through the backend API;
* displaying the current match score;
* sending point updates for either player;
* showing the match winner after completion;
* displaying completed match history;
* filtering matches by player name;
* paginating unfiltered match results.

## Features

* Responsive browser interface
* Shared header and footer
* Player creation form
* Player list
* Player selection for new matches
* Client-side match validation
* Live score display
* Point controls for both players
* Match completion status
* Winner display
* Completed match history
* Search by player first name
* Search by player last name
* Pagination for completed matches
* Selectable page size: `6`, `12`, or `24`
* Loading and empty-result states
* Backend error message handling
* Dynamic DOM rendering
* Centralized API request layer

## Technologies

| Technology      | Purpose                                |
| --------------- | -------------------------------------- |
| HTML5           | Page structure and forms               |
| CSS3            | Layout, styling, and responsive design |
| JavaScript      | Application logic and DOM manipulation |
| Fetch API       | Communication with the backend         |
| URLSearchParams | Query parameter creation and parsing   |
| REST API        | Data exchange with the backend         |
| JSON            | API response format                    |

## Application Pages

### Home

```text
index.html
```

The main page provides navigation to:

* New Match
* Players
* Finished Matches

### Players

```text
html/players.html
```

The Players page allows the user to:

* view all existing players;
* create a player using first name and last name;
* refresh the player list after successful creation;
* view backend validation errors.

### New Match

```text
html/new-match.html
```

The New Match page:

* loads available players from the backend;
* displays players in two selection fields;
* prevents creating a match with the same player on both sides;
* creates a new match;
* redirects to the score page using the returned match UUID.

### Match Score

```text
html/match-score.html?match_id={matchId}
```

The Match Score page displays:

* both player names;
* sets won;
* current games;
* current points;
* match status;
* the winner after the match is completed.

Each player has an **Add point** button. After a point is added, the page renders the updated match state returned by the backend.

When the match is completed, the scoring buttons are disabled and the winner is displayed.

### Finished Matches

```text
html/finishedMatches.html
```

The Finished Matches page allows the user to:

* view completed matches;
* see both players and the winner;
* search by first name;
* search by last name;
* search using both name fields;
* browse unfiltered results using pagination;
* select `6`, `12`, or `24` matches per page.

When a name filter is active, all matching results are displayed without pagination.

## Application Flow

```text
User action
    │
    ▼
Page-specific JavaScript
    │
    ▼
Central API module
    │
    ▼
Tennis Scoreboard Backend
    │
    ▼
JSON response
    │
    ▼
DOM update
```

### Creating a Match

```text
Load players
    ↓
Select two different players
    ↓
Create match through the API
    ↓
Receive match UUID
    ↓
Open the Match Score page
```

### Updating the Score

```text
Click "Add point"
    ↓
Send player ID and match UUID
    ↓
Backend calculates the new score
    ↓
Receive updated match state
    ↓
Render points, games, sets, and status
```

## Backend API Usage

The frontend communicates with the following backend endpoints:

### Players

| Method | Endpoint                                            | Frontend usage       |
| ------ | --------------------------------------------------- | -------------------- |
| `GET`  | `/players`                                          | Load the player list |
| `GET`  | `/player?id={id}`                                   | Retrieve a player    |
| `POST` | `/player?firstName={firstName}&lastName={lastName}` | Create a player      |

### Active Matches

| Method | Endpoint                                                | Frontend usage         |
| ------ | ------------------------------------------------------- | ---------------------- |
| `POST` | `/new-match?player1Id={id}&player2Id={id}`              | Create a match         |
| `GET`  | `/match-score?match_id={uuid}`                          | Load the current score |
| `POST` | `/match-score?match_id={uuid}&player_for_score_id={id}` | Award a point          |

### Completed Matches

| Method | Endpoint                                             | Frontend usage         |
| ------ | ---------------------------------------------------- | ---------------------- |
| `GET`  | `/matches`                                           | Load completed matches |
| `GET`  | `/matches?page={page}&limit={limit}`                 | Load paginated matches |
| `GET`  | `/matches?firstName={firstName}`                     | Filter by first name   |
| `GET`  | `/matches?lastName={lastName}`                       | Filter by last name    |
| `GET`  | `/matches?firstName={firstName}&lastName={lastName}` | Filter by full name    |

## Project Structure

```text
TennisScoreboardFront
├── html
│   ├── finishedMatches.html
│   ├── footer.html
│   ├── header.html
│   ├── match-score.html
│   ├── new-match.html
│   └── players.html
├── images
├── js
│   ├── api.js
│   ├── config.js
│   ├── finished-matches.js
│   ├── layout.js
│   ├── match-score.js
│   ├── new-match.js
│   └── players.js
├── finished-matches.css
├── index.html
└── styles.css
```

## JavaScript Structure

### `api.js`

Contains the shared API functions used by the pages:

* loading players;
* creating players;
* creating matches;
* retrieving active match scores;
* adding points;
* retrieving and filtering completed matches;
* processing JSON responses;
* processing unsuccessful HTTP responses.

### `layout.js`

Loads the shared header and footer and updates:

* navigation links;
* logo path;
* current year;
* current date and time;
* browser timezone.

### `players.js`

Controls the Players page:

* loads players;
* creates new players;
* validates form fields;
* renders the player list.

### `new-match.js`

Controls the New Match page:

* fills player selection fields;
* validates selected players;
* creates a match;
* redirects to the score page.

### `match-score.js`

Controls an active match:

* reads the match UUID from the URL;
* loads the current match state;
* renders player names and scores;
* sends point updates;
* disables controls after completion;
* displays the winner.

### `finished-matches.js`

Controls completed match history:

* loads finished matches;
* maps player IDs to names;
* filters matches by player;
* controls page size;
* renders pagination;
* handles loading and empty states.

## Responsive Design

The interface adapts to different screen sizes.

On smaller screens:

* navigation elements are rearranged vertically;
* forms switch to a single-column layout;
* score cards are displayed one below another;
* pagination controls use a compact layout.
