/* ============================================================
   FAMILY CARD LEAGUE
   PLAYERS PAGE

   Responsibilities:
   01. Firebase imports
   02. DOM references
   03. Live player listener
   04. Add player
   05. Duplicate checking
   06. Activate / deactivate player
   07. Render player list
   08. Update summary
   09. Helper functions
============================================================ */


/* ============================================================
   01. FIREBASE IMPORTS
============================================================ */

import {
    database
}
from "../firebase-config.js";


import {
    ref,
    push,
    set,
    update,
    onValue,
    get
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* ============================================================
   02. DOM REFERENCES
============================================================ */

const addPlayerForm =
    document.getElementById("addPlayerForm");


const playerNameInput =
    document.getElementById("playerNameInput");


const addPlayerButton =
    document.getElementById("addPlayerButton");


const formMessage =
    document.getElementById("formMessage");


const playersList =
    document.getElementById("playersList");


const playersLoadingState =
    document.getElementById("playersLoadingState");


const playersEmptyState =
    document.getElementById("playersEmptyState");


const totalPlayersCount =
    document.getElementById("totalPlayersCount");


const activePlayersCount =
    document.getElementById("activePlayersCount");


const inactivePlayersCount =
    document.getElementById("inactivePlayersCount");

const playerStatsMonthLabel =
    document.getElementById(
        "playerStatsMonthLabel"
    );


const playerStatsLoadingState =
    document.getElementById(
        "playerStatsLoadingState"
    );


const playerStatsEmptyState =
    document.getElementById(
        "playerStatsEmptyState"
    );


const monthlyPlayerStatsList =
    document.getElementById(
        "monthlyPlayerStatsList"
    );

/* ============================================================
   03. LOCAL PAGE DATA
============================================================ */

let currentPlayers = [];

let activeMonth = null;

let currentMonthGames = [];

let monthlyPlayerStats = [];

let monthGamesUnsubscribe = null;

/* ============================================================
   04. DATABASE REFERENCES
============================================================ */

const playersRef =
    ref(database, "players");

const activeMonthRef =
    ref(
        database,
        "settings/activeMonth"
    );

    /* ============================================================
   ACTIVE MONTH LISTENER
============================================================ */

onValue(

    activeMonthRef,

    (snapshot) => {

        if (
            !snapshot.exists()
        ) {

            activeMonth =
                null;


            currentMonthGames =
                [];


            playerStatsMonthLabel.textContent =
                "No active month";


            return;

        }


        activeMonth =
            snapshot.val();


        if (
            !activeMonth
            ||
            !activeMonth.id
        ) {

            playerStatsMonthLabel.textContent =
                "No active month";


            return;

        }


        playerStatsMonthLabel.textContent =
            activeMonth.label
            ||
            activeMonth.id;


        listenToCurrentMonthGames(
            activeMonth.id
        );

    },

    (error) => {

        console.error(
            "Unable to load active month:",
            error
        );


        playerStatsMonthLabel.textContent =
            "Month unavailable";

    }

);

/* ============================================================
   05. LIVE PLAYER LISTENER

   Whenever Firebase changes, this automatically runs again.

   This means:
   - New players appear immediately.
   - Status changes appear immediately.
   - Another phone sees the changes without refreshing.
============================================================ */

onValue(

    playersRef,

    (snapshot) => {

        currentPlayers = [];


        if (snapshot.exists()) {

            snapshot.forEach((childSnapshot) => {

                const playerData =
                    childSnapshot.val();


                currentPlayers.push({

                    id:
                        childSnapshot.key,

                    ...playerData

                });

            });

        }


        sortPlayers();

renderPlayers();

updatePlayerSummary();

calculateMonthlyPlayerStats();

renderMonthlyPlayerStats();

    },

    (error) => {

        console.error(
            "Unable to load players:",
            error
        );


        playersLoadingState.classList.add(
            "hidden"
        );


        showMessage(
            "Could not load players. Check your Firebase connection.",
            "error"
        );

    }

);



/* ============================================================
   06. ADD PLAYER FORM
============================================================ */

addPlayerForm.addEventListener(

    "submit",

    async (event) => {

        event.preventDefault();


        clearMessage();


        const playerName =
            cleanPlayerName(
                playerNameInput.value
            );


        /* --------------------------------------------
           Basic validation
        --------------------------------------------- */

        if (!playerName) {

            showMessage(
                "Please enter a player name.",
                "error"
            );

            return;

        }


        if (playerName.length < 2) {

            showMessage(
                "Player name must contain at least 2 characters.",
                "error"
            );

            return;

        }


        /* --------------------------------------------
           Duplicate player check

           Comparison is case-insensitive.

           Hassan and HASSAN cannot both be created.
        --------------------------------------------- */

        const duplicatePlayer =
            currentPlayers.find(

                (player) =>

                    normalizeName(player.name)
                    ===
                    normalizeName(playerName)

            );


        if (duplicatePlayer) {

            showMessage(
                `${duplicatePlayer.name} already exists.`,
                "error"
            );

            return;

        }


        /* --------------------------------------------
           Save player
        --------------------------------------------- */

        try {

            setFormBusy(true);


            const newPlayerRef =
                push(playersRef);


            const now =
                Date.now();


            const newPlayer = {

                name:
                    playerName,

                active:
                    true,

                createdAt:
                    now,

                updatedAt:
                    now

            };


            await set(
                newPlayerRef,
                newPlayer
            );


            playerNameInput.value =
                "";


            showMessage(
                `${playerName} added successfully.`,
                "success"
            );


            playerNameInput.focus();

        }

        catch (error) {

            console.error(
                "Error adding player:",
                error
            );


            showMessage(
                "Player could not be added.",
                "error"
            );

        }

        finally {

            setFormBusy(false);

        }

    }

);



/* ============================================================
   07. SORT PLAYERS

   Active players appear first.

   Within each group, names are alphabetical.
============================================================ */

function sortPlayers() {

    currentPlayers.sort(

        (playerA, playerB) => {

            if (
                playerA.active
                !==
                playerB.active
            ) {

                return playerA.active
                    ? -1
                    : 1;

            }


            return playerA.name.localeCompare(
                playerB.name
            );

        }

    );

}



/* ============================================================
   08. RENDER PLAYER LIST
============================================================ */

function renderPlayers() {

    playersLoadingState.classList.add(
        "hidden"
    );


    playersList.innerHTML =
        "";


    if (currentPlayers.length === 0) {

        playersEmptyState.classList.remove(
            "hidden"
        );


        playersList.classList.add(
            "hidden"
        );


        return;

    }


    playersEmptyState.classList.add(
        "hidden"
    );


    playersList.classList.remove(
        "hidden"
    );


    currentPlayers.forEach(

        (player) => {

            const playerRow =
                createPlayerRow(player);


            playersList.appendChild(
                playerRow
            );

        }

    );

}



/* ============================================================
   09. CREATE PLAYER ROW
============================================================ */

function createPlayerRow(player) {

    const row =
    document.createElement("div");


row.className =
    "player-row player-row-clickable";


row.setAttribute(
    "role",
    "link"
);


row.setAttribute(
    "tabindex",
    "0"
);


    /* --------------------------------------------
       Player Initials
    --------------------------------------------- */

    const avatar =
        document.createElement("div");


    avatar.className =
        "player-avatar";


    avatar.textContent =
        getInitials(player.name);



    /* --------------------------------------------
       Player Information
    --------------------------------------------- */

    const info =
        document.createElement("div");


    info.className =
        "player-info";


    const name =
        document.createElement("div");


    name.className =
        "player-name";


    name.textContent =
        player.name;


    const meta =
        document.createElement("div");


    meta.className =
        "player-meta";


    const status =
        document.createElement("span");


    status.className =
        player.active
            ? "status-badge status-active"
            : "status-badge status-inactive";


    status.textContent =
        player.active
            ? "Active"
            : "Inactive";


    const joined =
        document.createElement("span");


    joined.textContent =
        `Added ${formatDate(player.createdAt)}`;


    meta.appendChild(
        status
    );


    meta.appendChild(
        joined
    );


    info.appendChild(
        name
    );


    info.appendChild(
        meta
    );



    /* --------------------------------------------
       Action Button
    --------------------------------------------- */

    const actions =
        document.createElement("div");


    actions.className =
        "player-actions";


    const statusButton =
        document.createElement("button");


    statusButton.type =
        "button";


    statusButton.className =
        player.active
            ? "player-action-button deactivate"
            : "player-action-button activate";


    statusButton.textContent =
        player.active
            ? "Deactivate"
            : "Activate";


    statusButton.addEventListener(

        "click",

        () => {

            togglePlayerStatus(player);

        }

    );


    actions.appendChild(
        statusButton
    );

/* --------------------------------------------
   Open Player Profile
--------------------------------------------- */

const profileLink =
    `player-profile.html?player=${encodeURIComponent(
        player.id
    )}`;


row.addEventListener(

    "click",

    (event) => {

        /*
           If the user clicked the Activate /
           Deactivate button, do not open profile.
        */

        if (
            event.target.closest(
                ".player-action-button"
            )
        ) {

            return;

        }


        window.location.href =
            profileLink;

    }

);


row.addEventListener(

    "keydown",

    (event) => {

        if (
            event.key === "Enter"
            ||
            event.key === " "
        ) {

            if (
                event.target.closest(
                    ".player-action-button"
                )
            ) {

                return;

            }


            event.preventDefault();


            window.location.href =
                profileLink;

        }

    }

);

    /* --------------------------------------------
       Assemble Player Row
    --------------------------------------------- */

    row.appendChild(
        avatar
    );


    row.appendChild(
        info
    );


    row.appendChild(
        actions
    );


    return row;

}



/* ============================================================
   10. ACTIVATE / DEACTIVATE PLAYER
============================================================ */

async function togglePlayerStatus(player) {

    const newStatus =
        !player.active;


    const actionWord =
        newStatus
            ? "activate"
            : "deactivate";


    const confirmed =
        window.confirm(
            `Do you want to ${actionWord} ${player.name}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const playerRef =
            ref(
                database,
                `players/${player.id}`
            );


        await update(

            playerRef,

            {

                active:
                    newStatus,

                updatedAt:
                    Date.now()

            }

        );


        showMessage(
            `${player.name} is now ${newStatus ? "active" : "inactive"}.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Unable to change player status:",
            error
        );


        showMessage(
            "Player status could not be changed.",
            "error"
        );

    }

}



/* ============================================================
   11. PLAYER SUMMARY
============================================================ */

function updatePlayerSummary() {

    const total =
        currentPlayers.length;


    const active =
        currentPlayers.filter(
            (player) => player.active
        ).length;


    const inactive =
        total - active;


    totalPlayersCount.textContent =
        total;


    activePlayersCount.textContent =
        active;


    inactivePlayersCount.textContent =
        inactive;

}



/* ============================================================
   12. CLEAN PLAYER NAME

   Example:

   "   Hassan   Jaufar "
   becomes
   "Hassan Jaufar"
============================================================ */

function cleanPlayerName(name) {

    return name
        .trim()
        .replace(/\s+/g, " ");

}



/* ============================================================
   13. NORMALIZE NAME FOR DUPLICATE CHECK
============================================================ */

function normalizeName(name) {

    return cleanPlayerName(name)
        .toLocaleLowerCase();

}



/* ============================================================
   14. PLAYER INITIALS

   Hassan Jaufar -> HJ
   Hassan -> H
============================================================ */

function getInitials(name) {

    const words =
        cleanPlayerName(name)
        .split(" ");


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0)
        +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}



/* ============================================================
   15. FORMAT DATE
============================================================ */

function formatDate(timestamp) {

    if (!timestamp) {

        return "Unknown";

    }


    const date =
        new Date(timestamp);


    return date.toLocaleDateString(

        "en-GB",

        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }

    );

}



/* ============================================================
   16. FORM BUSY STATE
============================================================ */

function setFormBusy(isBusy) {

    addPlayerButton.disabled =
        isBusy;


    playerNameInput.disabled =
        isBusy;


    addPlayerButton.textContent =
        isBusy
            ? "Adding..."
            : "Add Player";

}



/* ============================================================
   17. FORM MESSAGES
============================================================ */

function showMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;

}



function clearMessage() {

    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";

}

/* ============================================================
   18. CURRENT MONTH GAMES LISTENER
============================================================ */

function listenToCurrentMonthGames(
    monthId
) {

    /*
       Stop listening to an older month
       if the active month changes.
    */

    if (
        monthGamesUnsubscribe
    ) {

        monthGamesUnsubscribe();

        monthGamesUnsubscribe =
            null;

    }


    currentMonthGames =
        [];


    const gamesRef =
        ref(
            database,
            `months/${monthId}/games`
        );


    monthGamesUnsubscribe =
        onValue(

            gamesRef,

            (snapshot) => {

                currentMonthGames =
                    [];


                if (
                    snapshot.exists()
                ) {

                    snapshot.forEach(

                        (childSnapshot) => {

                            currentMonthGames.push({

                                id:
                                    childSnapshot.key,

                                ...childSnapshot.val()

                            });

                        }

                    );

                }

calculateMonthlyPlayerStats();

renderMonthlyPlayerStats();

                console.log(
                    "Current month games loaded:",
                    currentMonthGames.length
                );

            },

            (error) => {

                console.error(
                    "Unable to load current month games:",
                    error
                );

            }

        );

}

/* ============================================================
   19. CALCULATE MONTHLY PLAYER STATISTICS

   Only COMPLETED games count.

   ACTIVE and CANCELLED games are ignored.
============================================================ */

function calculateMonthlyPlayerStats() {

    const completedGames =
        currentMonthGames.filter(

            (game) =>
                game.status === "COMPLETED"

        );


    /*
       Start with every player.

       This allows players with zero completed games
       to still exist in the statistics data.
    */

    monthlyPlayerStats =
        currentPlayers.map(

            (player) => ({

                id:
                    player.id,

                name:
                    player.name,

                active:
                    player.active,

                gamesPlayed:
                    0,

                gamesWon:
                    0,

                totalPoints:
                    0,

                winPercentage:
                    0,

                rank:
                    null

            })

        );


    const statsByPlayerId =
        new Map();


    monthlyPlayerStats.forEach(

        (player) => {

            statsByPlayerId.set(
                player.id,
                player
            );

        }

    );


    /*
       Process every completed game.
    */

    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayersForStats(game);


            const gameTotals =
                getGameTotalsForStats(
                    game,
                    gamePlayers
                );


            const winnerIds =
                getWinnerIdsForStats(
                    game,
                    gamePlayers,
                    gameTotals
                );


            gamePlayers.forEach(

                (gamePlayer) => {

                    const playerStats =
                        statsByPlayerId.get(
                            gamePlayer.id
                        );


                    if (!playerStats) {
                        return;
                    }


                    playerStats.gamesPlayed +=
                        1;


                    playerStats.totalPoints +=
                        Number(
                            gameTotals[
                                gamePlayer.id
                            ]
                            || 0
                        );


                    if (
                        winnerIds.includes(
                            gamePlayer.id
                        )
                    ) {

                        playerStats.gamesWon +=
                            1;

                    }

                }

            );

        }

    );


    /*
       Calculate Win %
    */

    monthlyPlayerStats.forEach(

        (player) => {

            player.winPercentage =
                player.gamesPlayed > 0
                    ? (
                        player.gamesWon
                        /
                        player.gamesPlayed
                        *
                        100
                    )
                    : 0;

        }

    );


    /*
       Ranking rules:

       1. Total points
       2. Win %
       3. Games won
       4. Same values = joint rank

       Players with zero games are shown after
       players who have completed games.
    */

    monthlyPlayerStats.sort(

        (playerA, playerB) => {

            if (
                playerA.gamesPlayed === 0
                &&
                playerB.gamesPlayed > 0
            ) {

                return 1;

            }


            if (
                playerB.gamesPlayed === 0
                &&
                playerA.gamesPlayed > 0
            ) {

                return -1;

            }


            if (
                playerB.totalPoints
                !==
                playerA.totalPoints
            ) {

                return (
                    playerB.totalPoints
                    -
                    playerA.totalPoints
                );

            }


            if (
                playerB.winPercentage
                !==
                playerA.winPercentage
            ) {

                return (
                    playerB.winPercentage
                    -
                    playerA.winPercentage
                );

            }


            if (
                playerB.gamesWon
                !==
                playerA.gamesWon
            ) {

                return (
                    playerB.gamesWon
                    -
                    playerA.gamesWon
                );

            }


            return playerA.name.localeCompare(
                playerB.name
            );

        }

    );


    assignMonthlyPlayerRanks();

}



/* ============================================================
   20. ASSIGN MONTHLY PLAYER RANKS

   Competition ranking:

   1, 1, 1, 4
============================================================ */

function assignMonthlyPlayerRanks() {

    let previousPlayer =
        null;


    monthlyPlayerStats.forEach(

        (player, index) => {

            if (
                player.gamesPlayed === 0
            ) {

                player.rank =
                    null;

                return;

            }


            if (
                !previousPlayer
            ) {

                player.rank =
                    1;

            }

            else if (
                hasSameMonthlyRankingValues(
                    player,
                    previousPlayer
                )
            ) {

                player.rank =
                    previousPlayer.rank;

            }

            else {

                player.rank =
                    index + 1;

            }


            previousPlayer =
                player;

        }

    );

}



/* ============================================================
   21. SAME RANK CHECK
============================================================ */

function hasSameMonthlyRankingValues(
    playerA,
    playerB
) {

    return (
        playerA.totalPoints
        ===
        playerB.totalPoints

        &&

        playerA.winPercentage
        ===
        playerB.winPercentage

        &&

        playerA.gamesWon
        ===
        playerB.gamesWon
    );

}



/* ============================================================
   22. RENDER MONTHLY PLAYER STATISTICS
============================================================ */

function renderMonthlyPlayerStats() {

    playerStatsLoadingState.classList.add(
        "hidden"
    );


    monthlyPlayerStatsList.innerHTML =
        "";


    const playersWithCompletedGames =
        monthlyPlayerStats.filter(

            (player) =>
                player.gamesPlayed > 0

        );


    if (
        playersWithCompletedGames.length === 0
    ) {

        playerStatsEmptyState.classList.remove(
            "hidden"
        );


        monthlyPlayerStatsList.classList.add(
            "hidden"
        );


        return;

    }


    playerStatsEmptyState.classList.add(
        "hidden"
    );


    monthlyPlayerStatsList.classList.remove(
        "hidden"
    );


    playersWithCompletedGames.forEach(

        (player) => {

            const row =
                createMonthlyPlayerStatRow(
                    player
                );


            monthlyPlayerStatsList.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   23. CREATE MONTHLY PLAYER STAT ROW
============================================================ */

function createMonthlyPlayerStatRow(
    player
) {

    const row =
        document.createElement("div");


    row.className =
        "monthly-player-stat-row";


    const winPercentageText =
        `${formatWinPercentage(
            player.winPercentage
        )}%`;


    row.innerHTML = `

        <div class="monthly-player-stat-top">

            <div class="monthly-player-stat-name">
                ${escapePlayerStatsHTML(
                    player.name
                )}
            </div>


            <div class="monthly-player-stat-rank">
                #${player.rank}
            </div>

        </div>


        <div class="monthly-player-stat-grid">

            <div class="monthly-player-stat-item">

                <strong>
                    ${player.gamesPlayed}
                </strong>

                <span>
                    Played
                </span>

            </div>


            <div class="monthly-player-stat-item">

                <strong>
                    ${player.gamesWon}
                </strong>

                <span>
                    Won
                </span>

            </div>


            <div class="monthly-player-stat-item">

                <strong>
                    ${winPercentageText}
                </strong>

                <span>
                    Win %
                </span>

            </div>


            <div class="monthly-player-stat-item">

                <strong>
                    ${player.totalPoints}
                </strong>

                <span>
                    Points
                </span>

            </div>

        </div>

    `;


    return row;

}



/* ============================================================
   24. GET GAME PLAYERS FOR STATS
============================================================ */

function getGamePlayersForStats(
    game
) {

    if (!game.players) {

        return [];

    }


    if (
        Array.isArray(
            game.players
        )
    ) {

        return game.players
            .filter(Boolean)
            .map(

                (player, index) => ({

                    id:
                        player.id
                        ||
                        player.playerId
                        ||
                        String(index),

                    name:
                        player.name
                        ||
                        `Player ${index + 1}`

                })

            );

    }


    return Object.entries(
        game.players
    ).map(

        ([key, player]) => ({

            id:
                player?.id
                ||
                player?.playerId
                ||
                key,

            name:
                player?.name
                ||
                key

        })

    );

}



/* ============================================================
   25. GET GAME TOTALS FOR STATS

   Prefer saved finalTotals.

   If unavailable, calculate from individual matches.
============================================================ */

function getGameTotalsForStats(
    game,
    gamePlayers
) {

    const totals =
        {};


    gamePlayers.forEach(

        (player) => {

            totals[player.id] =
                0;

        }

    );


    if (
        game.finalTotals
        &&
        typeof game.finalTotals === "object"
    ) {

        Object.entries(
            game.finalTotals
        ).forEach(

            ([playerId, score]) => {

                totals[playerId] =
                    Number(score || 0);

            }

        );


        return totals;

    }


    if (!game.matches) {

        return totals;

    }


    Object.values(
        game.matches
    ).forEach(

        (match) => {

            if (!match) {
                return;
            }


            gamePlayers.forEach(

                (player) => {

                    totals[player.id] +=
                        getMatchScoreForPlayer(
                            match,
                            player
                        );

                }

            );

        }

    );


    return totals;

}



/* ============================================================
   26. GET MATCH SCORE FOR PLAYER
============================================================ */

function getMatchScoreForPlayer(
    match,
    player
) {

    /*
       Current game structure normally stores scores
       inside match.scores.

       This also supports direct score objects as fallback.
    */

    const scores =
        match.scores
        &&
        typeof match.scores === "object"
            ? match.scores
            : match;


    if (
        scores[player.id]
        !==
        undefined
    ) {

        return Number(
            scores[player.id]
            ||
            0
        );

    }


    return 0;

}



/* ============================================================
   27. GET WINNER IDS

   Prefer the saved winners array.

   If unavailable, derive winners from the highest total.
============================================================ */

function getWinnerIdsForStats(
    game,
    gamePlayers,
    gameTotals
) {

    if (
        Array.isArray(
            game.winners
        )
        &&
        game.winners.length > 0
    ) {

        return game.winners
            .map(

                (winner) => {

                    if (
                        typeof winner === "string"
                    ) {

                        return winner;

                    }


                    return (
                        winner.id
                        ||
                        winner.playerId
                        ||
                        null
                    );

                }

            )
            .filter(Boolean);

    }


    if (
        gamePlayers.length === 0
    ) {

        return [];

    }


    const scores =
        gamePlayers.map(

            (player) =>
                Number(
                    gameTotals[player.id]
                    ||
                    0
                )

        );


    const highestScore =
        Math.max(
            ...scores
        );


    return gamePlayers
        .filter(

            (player) =>

                Number(
                    gameTotals[player.id]
                    ||
                    0
                )
                ===
                highestScore

        )
        .map(
            (player) => player.id
        );

}



/* ============================================================
   28. FORMAT WIN %
============================================================ */

function formatWinPercentage(
    percentage
) {

    if (
        Number.isInteger(
            percentage
        )
    ) {

        return String(
            percentage
        );

    }


    return percentage.toFixed(1);

}



/* ============================================================
   29. SAFE HTML FOR PLAYER STAT NAMES
============================================================ */

function escapePlayerStatsHTML(
    value
) {

    return String(
        value ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        '"',
        "&quot;"
    )

    .replaceAll(
        "'",
        "&#039;"
    );

}