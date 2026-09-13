/* ============================================================
   FAMILY CARD LEAGUE
   DASHBOARD

   STEP 5B

   Calculates from COMPLETED games only:

   01. Games this month
   02. Active players
   03. Overall ranking
   04. Games played
   05. Games won
   06. Win %
   07. Total points
   08. Monthly records
   09. Category cutoff
   10. Category 1 ranking
   11. Category 2 ranking
============================================================ */


/* ============================================================
   01. FIREBASE IMPORTS
============================================================ */

import {
    database
}
from "./firebase-config.js";


import {
    ref,
    onValue
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* ============================================================
   02. DASHBOARD STATE
============================================================ */

let activeMonth = null;

let allPlayers = {};

let monthGames = {};


/* ============================================================
   03. DOM REFERENCES
============================================================ */

const monthGamesCount =
    document.getElementById(
        "monthGamesCount"
    );


const activePlayersCount =
    document.getElementById(
        "activePlayersCount"
    );


const categoryCutoff =
    document.getElementById(
        "categoryCutoff"
    );


const rankingEmptyState =
    document.getElementById(
        "rankingEmptyState"
    );


const rankingTableWrapper =
    document.getElementById(
        "rankingTableWrapper"
    );


const rankingTableBody =
    document.getElementById(
        "rankingTableBody"
    );

    /* ============================================================
   ACTIVE GAME ELEMENTS
============================================================ */

const continueGameCard =
    document.getElementById(
        "continueGameCard"
    );


const continueGameTitle =
    document.getElementById(
        "continueGameTitle"
    );


const continueGameDescription =
    document.getElementById(
        "continueGameDescription"
    );


const startNewGameCard =
    document.getElementById(
        "startNewGameCard"
    );

/* ============================================================
   MONTHLY RECORD ELEMENTS
============================================================ */

const highestMatchScore =
    document.getElementById(
        "highestMatchScore"
    );


const highestMatchPlayer =
    document.getElementById(
        "highestMatchPlayer"
    );


const highestMatchDetail =
    document.getElementById(
        "highestMatchDetail"
    );


const lowestMatchScore =
    document.getElementById(
        "lowestMatchScore"
    );


const lowestMatchPlayer =
    document.getElementById(
        "lowestMatchPlayer"
    );


const lowestMatchDetail =
    document.getElementById(
        "lowestMatchDetail"
    );


const highestGameScore =
    document.getElementById(
        "highestGameScore"
    );


const highestGamePlayer =
    document.getElementById(
        "highestGamePlayer"
    );


const highestGameDetail =
    document.getElementById(
        "highestGameDetail"
    );


const lowestGameScore =
    document.getElementById(
        "lowestGameScore"
    );


const lowestGamePlayer =
    document.getElementById(
        "lowestGamePlayer"
    );


const lowestGameDetail =
    document.getElementById(
        "lowestGameDetail"
    );


/* ============================================================
   CATEGORY ELEMENTS
============================================================ */

const categoryOneCutoff =
    document.getElementById(
        "categoryOneCutoff"
    );


const categoryOneFirst =
    document.getElementById(
        "categoryOneFirst"
    );


const categoryOneSecond =
    document.getElementById(
        "categoryOneSecond"
    );


const categoryOneThird =
    document.getElementById(
        "categoryOneThird"
    );

    const categoryOneAllPlayers =
    document.getElementById(
        "categoryOneAllPlayers"
    );

const categoryTwoFirst =
    document.getElementById(
        "categoryTwoFirst"
    );


const categoryTwoSecond =
    document.getElementById(
        "categoryTwoSecond"
    );


const categoryTwoThird =
    document.getElementById(
        "categoryTwoThird"
    );

    const categoryTwoAllPlayers =
    document.getElementById(
        "categoryTwoAllPlayers"
    );

/* ============================================================
   04. INITIALIZE
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        listenForActiveMonth();

        listenForPlayers();

    }

);


/* ============================================================
   05. ACTIVE MONTH
============================================================ */

function listenForActiveMonth() {

    const activeMonthRef =
        ref(
            database,
            "settings/activeMonth"
        );


    onValue(

        activeMonthRef,

        (snapshot) => {

            if (!snapshot.exists()) {

                console.warn(
                    "No active month found."
                );

                return;

            }


            activeMonth =
                snapshot.val();


            displayActiveMonth();


            listenForMonthGames();

        },

        (error) => {

            console.error(
                "Active month error:",
                error
            );

        }

    );

}


/* ============================================================
   06. DISPLAY MONTH
============================================================ */

function displayActiveMonth() {

    if (!activeMonth) {
        return;
    }


    const monthElement =
        document.getElementById(
            "currentMonth"
        );


    if (monthElement) {

        monthElement.textContent =
            activeMonth.label;

    }

}


/* ============================================================
   07. PLAYERS
============================================================ */

function listenForPlayers() {

    const playersRef =
        ref(
            database,
            "players"
        );


    onValue(

        playersRef,

        (snapshot) => {

            allPlayers =
                snapshot.exists()
                    ? snapshot.val()
                    : {};


            updateActivePlayerCount();


            calculateDashboard();

        },

        (error) => {

            console.error(
                "Players error:",
                error
            );

        }

    );

}


/* ============================================================
   08. MONTH GAMES
============================================================ */

function listenForMonthGames() {

    if (!activeMonth?.id) {
        return;
    }


    const gamesRef =
        ref(
            database,
            `months/${activeMonth.id}/games`
        );


    onValue(

        gamesRef,

        (snapshot) => {

            monthGames =
                snapshot.exists()
                    ? snapshot.val()
                    : {};


            calculateDashboard();

        },

        (error) => {

            console.error(
                "Games error:",
                error
            );

        }

    );

}


/* ============================================================
   09. ACTIVE PLAYER COUNT
============================================================ */

function updateActivePlayerCount() {

    const count =
        Object.values(
            allPlayers
        )
        .filter(

            player =>
                player.active === true

        )
        .length;


    if (activePlayersCount) {

        activePlayersCount.textContent =
            count;

    }

}


/* ============================================================
   10. MAIN DASHBOARD CALCULATION
============================================================ */

function calculateDashboard() {

    if (!activeMonth) {
        return;
    }


    const completedGames =
        getCompletedGames();

        const activeGames =
    getActiveGames();


renderActiveGame(
    activeGames
);


    if (monthGamesCount) {

        monthGamesCount.textContent =
            completedGames.length;

    }


    const playerStats =
        calculatePlayerStats(
            completedGames
        );


    const ranking =
        buildRanking(
            Object.values(
                playerStats
            )
        );


    renderOverallRanking(
        ranking
    );


    calculateAndRenderRecords(
        completedGames,
        playerStats
    );


    calculateAndRenderCategories(
        playerStats
    );

}


/* ============================================================
   11. COMPLETED GAMES ONLY
============================================================ */

function getCompletedGames() {

    return Object.entries(
        monthGames
    )
    .filter(

        ([gameId, game]) =>
            game
            &&
            game.status === "COMPLETED"

    )
    .map(

        ([gameId, game]) => ({

            id:
                gameId,

            ...game

        })

    );

}

/* ============================================================
   GET ACTIVE GAMES
============================================================ */

function getActiveGames() {

    return Object.entries(
        monthGames
    )
    .filter(

        ([gameId, game]) =>

            game
            &&
            game.status === "ACTIVE"

    )
    .map(

        ([gameId, game]) => ({

            id:
                gameId,

            ...game

        })

    )
    .sort(

        (a, b) =>

            Number(
                a.gameNumber
            )
            -
            Number(
                b.gameNumber
            )

    );

}

/* ============================================================
   ACTIVE GAME / CONTINUE GAME CARD
============================================================ */

function renderActiveGame(
    activeGames
) {

    if (
        !continueGameCard
        ||
        !startNewGameCard
    ) {

        return;

    }


    /*
       No active game:
       hide Continue Game
       show Start New Game normally.
    */

    if (
        activeGames.length === 0
    ) {

        continueGameCard.classList.add(
            "hidden"
        );


        startNewGameCard.classList.remove(
            "hidden"
        );


        return;

    }


    /*
       For now we allow only ONE active game.

       If old data somehow contains multiple active games,
       we show the first one by game number.
    */

    const game =
        activeGames[0];


    const completedMatches =
        Number(
            game.completedMatches
        ) || 0;


    const nextMatch =
        Math.min(
            completedMatches + 1,
            10
        );


    if (continueGameTitle) {

        continueGameTitle.textContent =
            `Continue Game #${game.gameNumber}`;

    }


    if (continueGameDescription) {

        continueGameDescription.textContent =
            `Match ${nextMatch} of 10 · ${game.monthLabel || activeMonth?.label || ""}`;

    }


    continueGameCard.href =
        `pages/live-game.html?month=${encodeURIComponent(
            game.monthId
            ||
            activeMonth.id
        )}&game=${encodeURIComponent(
            game.id
        )}`;


    continueGameCard.classList.remove(
        "hidden"
    );


    /*
       IMPORTANT:

       We hide Start New Game while another game
       is active.

       This prevents accidental duplicate games.
    */

    startNewGameCard.classList.add(
        "hidden"
    );

}


/* ============================================================
   12. PLAYER STATISTICS
============================================================ */

function calculatePlayerStats(
    completedGames
) {

    const stats = {};


    completedGames.forEach(

        (game) => {

            if (!game.players) {
                return;
            }


            /* -----------------------------------------------
               GAME PARTICIPATION
            ------------------------------------------------ */

            Object.entries(
                game.players
            )
            .forEach(

                ([playerId, gamePlayer]) => {

                    if (!stats[playerId]) {

                        stats[playerId] = {

                            playerId:
                                playerId,

                            name:
                                getPlayerName(
                                    playerId,
                                    gamePlayer
                                ),

                            gamesPlayed:
                                0,

                            gamesWon:
                                0,

                            totalPoints:
                                0,

                            winPercentage:
                                0

                        };

                    }


                    stats[
                        playerId
                    ].gamesPlayed += 1;


                    stats[
                        playerId
                    ].totalPoints +=
                        getPlayerGamePoints(
                            game,
                            playerId
                        );

                }

            );


            /* -----------------------------------------------
               WINNERS

               All tied winners receive a win.
            ------------------------------------------------ */

            if (game.winners) {

                Object.keys(
                    game.winners
                )
                .forEach(

                    winnerId => {

                        if (
                            stats[winnerId]
                        ) {

                            stats[
                                winnerId
                            ].gamesWon += 1;

                        }

                    }

                );

            }

        }

    );


    /* --------------------------------------------------------
       WIN %
    --------------------------------------------------------- */

    Object.values(
        stats
    )
    .forEach(

        player => {

            if (
                player.gamesPlayed > 0
            ) {

                player.winPercentage =
                    (
                        player.gamesWon
                        /
                        player.gamesPlayed
                    )
                    *
                    100;

            }

        }

    );


    return stats;

}


/* ============================================================
   13. PLAYER'S TOTAL FROM ONE GAME
============================================================ */

function getPlayerGamePoints(
    game,
    playerId
) {

    let total =
        0;


    if (!game.matches) {

        return total;

    }


    Object.values(
        game.matches
    )
    .forEach(

        match => {

            const score =
                Number(
                    match.scores?.[
                        playerId
                    ]
                );


            if (
                Number.isFinite(score)
                &&
                Number.isInteger(score)
            ) {

                total +=
                    score;

            }

        }

    );


    return total;

}


/* ============================================================
   14. PLAYER NAME
============================================================ */

function getPlayerName(
    playerId,
    gamePlayer
) {

    if (
        allPlayers[
            playerId
        ]?.name
    ) {

        return allPlayers[
            playerId
        ].name;

    }


    return (
        gamePlayer?.name
        ||
        "Unknown Player"
    );

}


/* ============================================================
   15. GENERAL RANKING

   Rules:

   1. Total points
   2. Win %
   3. Games won
   4. Joint position if still equal
============================================================ */

function buildRanking(
    players
) {

    const ranking =
        [...players];


    ranking.sort(

        (a, b) => {

            if (
                b.totalPoints
                !==
                a.totalPoints
            ) {

                return (
                    b.totalPoints
                    -
                    a.totalPoints
                );

            }


            if (
                b.winPercentage
                !==
                a.winPercentage
            ) {

                return (
                    b.winPercentage
                    -
                    a.winPercentage
                );

            }


            if (
                b.gamesWon
                !==
                a.gamesWon
            ) {

                return (
                    b.gamesWon
                    -
                    a.gamesWon
                );

            }


            return a.name.localeCompare(
                b.name
            );

        }

    );


    let previousPlayer =
        null;


    let previousRank =
        0;


    ranking.forEach(

        (player, index) => {

            if (
                previousPlayer
                &&
                sameRankingResult(
                    player,
                    previousPlayer
                )
            ) {

                player.rank =
                    previousRank;

            }

            else {

                player.rank =
                    index + 1;

            }


            previousRank =
                player.rank;


            previousPlayer =
                player;

        }

    );


    return ranking;

}


/* ============================================================
   16. JOINT POSITION CHECK
============================================================ */

function sameRankingResult(
    a,
    b
) {

    return (

        a.totalPoints
            ===
        b.totalPoints

        &&

        a.winPercentage
            ===
        b.winPercentage

        &&

        a.gamesWon
            ===
        b.gamesWon

    );

}


/* ============================================================
   17. OVERALL RANKING DISPLAY
============================================================ */

function renderOverallRanking(
    ranking
) {

    if (
        !rankingTableBody
        ||
        !rankingEmptyState
        ||
        !rankingTableWrapper
    ) {

        return;

    }


    if (
        ranking.length === 0
    ) {

        rankingTableBody.innerHTML =
            "";


        rankingEmptyState.classList.remove(
            "hidden"
        );


        rankingTableWrapper.classList.add(
            "hidden"
        );


        return;

    }


    rankingEmptyState.classList.add(
        "hidden"
    );


    rankingTableWrapper.classList.remove(
        "hidden"
    );


    rankingTableBody.innerHTML =
        "";


    ranking.forEach(

        player => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${player.rank}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        player.name
                    )}
                </td>

                <td>
                    ${player.gamesPlayed}
                </td>

                <td>
                    ${player.gamesWon}
                </td>

                <td>
                    ${formatPercentage(
                        player.winPercentage
                    )}
                </td>

                <td>
                    <strong>
                        ${formatPoints(
                            player.totalPoints
                        )}
                    </strong>
                </td>

            `;


            rankingTableBody.appendChild(
                row
            );

        }

    );

}


/* ============================================================
   18. MONTHLY RECORDS
============================================================ */

function calculateAndRenderRecords(
    completedGames,
    playerStats
) {

    if (
        completedGames.length === 0
    ) {

        resetRecords();

        return;

    }


    const matchRecords =
        [];


    const gameRecords =
        [];


    completedGames.forEach(

        game => {


            /* -----------------------------------------------
               SINGLE MATCH RECORDS
            ------------------------------------------------ */

            if (game.matches) {

                Object.entries(
                    game.matches
                )
                .forEach(

                    ([matchNumber, match]) => {

                        if (!match.scores) {
                            return;
                        }


                        Object.entries(
                            match.scores
                        )
                        .forEach(

                            ([playerId, scoreValue]) => {

                                const score =
                                    Number(
                                        scoreValue
                                    );


                                if (
                                    !Number.isFinite(score)
                                    ||
                                    !Number.isInteger(score)
                                ) {

                                    return;

                                }


                                matchRecords.push({

                                    playerId:
                                        playerId,

                                    name:
                                        getHistoricalPlayerName(
                                            game,
                                            playerId
                                        ),

                                    score:
                                        score,

                                    gameNumber:
                                        Number(
                                            game.gameNumber
                                        ),

                                    matchNumber:
                                        Number(
                                            matchNumber
                                        ),

                                    date:
                                        game.completedAt
                                        ||
                                        game.createdAt
                                        ||
                                        null

                                });

                            }

                        );

                    }

                );

            }


            /* -----------------------------------------------
               COMPLETE GAME RECORDS
            ------------------------------------------------ */

            Object.keys(
                game.players || {}
            )
            .forEach(

                playerId => {

                    gameRecords.push({

                        playerId:
                            playerId,

                        name:
                            getHistoricalPlayerName(
                                game,
                                playerId
                            ),

                        score:
                            getPlayerGamePoints(
                                game,
                                playerId
                            ),

                        gameNumber:
                            Number(
                                game.gameNumber
                            ),

                        date:
                            game.completedAt
                            ||
                            game.createdAt
                            ||
                            null

                    });

                }

            );

        }

    );


    if (
        matchRecords.length === 0
        ||
        gameRecords.length === 0
    ) {

        resetRecords();

        return;

    }


    const highestMatch =
        chooseRecord(

            matchRecords,

            "highest",

            playerStats

        );


    const lowestMatch =
        chooseRecord(

            matchRecords,

            "lowest",

            playerStats

        );


    const highestGame =
        chooseRecord(

            gameRecords,

            "highest",

            playerStats

        );


    const lowestGame =
        chooseRecord(

            gameRecords,

            "lowest",

            playerStats

        );


    renderMatchRecord(

        highestMatch,

        highestMatchScore,

        highestMatchPlayer,

        highestMatchDetail

    );


    renderMatchRecord(

        lowestMatch,

        lowestMatchScore,

        lowestMatchPlayer,

        lowestMatchDetail

    );


    renderGameRecord(

        highestGame,

        highestGameScore,

        highestGamePlayer,

        highestGameDetail

    );


    renderGameRecord(

        lowestGame,

        lowestGameScore,

        lowestGamePlayer,

        lowestGameDetail

    );

}


/* ============================================================
   19. CHOOSE RECORD

   Main comparison:
   - score

   If same record score:
   - higher Win %
   - more Games Won
   - alphabetical only for stable display
============================================================ */

function chooseRecord(
    records,
    type,
    playerStats
) {

    const sorted =
        [...records];


    sorted.sort(

        (a, b) => {

            if (
                a.score
                !==
                b.score
            ) {

                if (
                    type === "highest"
                ) {

                    return (
                        b.score
                        -
                        a.score
                    );

                }


                return (
                    a.score
                    -
                    b.score
                );

            }


            const statsA =
                playerStats[
                    a.playerId
                ] || {};


            const statsB =
                playerStats[
                    b.playerId
                ] || {};


            const winA =
                Number(
                    statsA.winPercentage
                ) || 0;


            const winB =
                Number(
                    statsB.winPercentage
                ) || 0;


            if (
                winB !== winA
            ) {

                return (
                    winB - winA
                );

            }


            const gamesWonA =
                Number(
                    statsA.gamesWon
                ) || 0;


            const gamesWonB =
                Number(
                    statsB.gamesWon
                ) || 0;


            if (
                gamesWonB
                !==
                gamesWonA
            ) {

                return (
                    gamesWonB
                    -
                    gamesWonA
                );

            }


            return a.name.localeCompare(
                b.name
            );

        }

    );


    return sorted[0];

}


/* ============================================================
   20. HISTORICAL PLAYER NAME
============================================================ */

function getHistoricalPlayerName(
    game,
    playerId
) {

    return (
        allPlayers[
            playerId
        ]?.name

        ||

        game.players?.[
            playerId
        ]?.name

        ||

        "Unknown Player"
    );

}


/* ============================================================
   21. RENDER SINGLE MATCH RECORD
============================================================ */

function renderMatchRecord(
    record,
    scoreElement,
    playerElement,
    detailElement
) {

    if (!record) {
        return;
    }


    scoreElement.textContent =
        formatPoints(
            record.score
        );


    playerElement.textContent =
        record.name;


    detailElement.textContent =
        `Game #${record.gameNumber} · Match ${record.matchNumber} · ${formatDate(record.date)}`;

}


/* ============================================================
   22. RENDER COMPLETE GAME RECORD
============================================================ */

function renderGameRecord(
    record,
    scoreElement,
    playerElement,
    detailElement
) {

    if (!record) {
        return;
    }


    scoreElement.textContent =
        formatPoints(
            record.score
        );


    playerElement.textContent =
        record.name;


    detailElement.textContent =
        `Game #${record.gameNumber} · ${formatDate(record.date)}`;

}


/* ============================================================
   23. RESET RECORD DISPLAY
============================================================ */

function resetRecords() {

    const scoreElements = [

        highestMatchScore,
        lowestMatchScore,
        highestGameScore,
        lowestGameScore

    ];


    scoreElements.forEach(

        element => {

            if (element) {

                element.textContent =
                    "—";

            }

        }

    );


    const playerElements = [

        highestMatchPlayer,
        lowestMatchPlayer,
        highestGamePlayer,
        lowestGamePlayer

    ];


    playerElements.forEach(

        element => {

            if (element) {

                element.textContent =
                    "No record yet";

            }

        }

    );


    const detailElements = [

        highestMatchDetail,
        lowestMatchDetail,
        highestGameDetail,
        lowestGameDetail

    ];


    detailElements.forEach(

        element => {

            if (element) {

                element.textContent =
                    "Complete a game to begin";

            }

        }

    );

}


/* ============================================================
   24. CATEGORIES

   Cutoff:

   ceil(
       highest games played
       /
       2
   )

   Example:

   highest = 20
   cutoff = 10

   highest = 17
   cutoff = 9
============================================================ */

function calculateAndRenderCategories(
    playerStats
) {

    const players =
        Object.values(
            playerStats
        );


    if (
        players.length === 0
    ) {

        resetCategories();

        return;

    }


    const maximumGamesPlayed =
        Math.max(

            ...players.map(

                player =>
                    player.gamesPlayed

            )

        );


    const cutoff =
        Math.ceil(
            maximumGamesPlayed
            /
            2
        );


    if (categoryCutoff) {

        categoryCutoff.textContent =
            cutoff;

    }


    if (categoryOneCutoff) {

        categoryOneCutoff.textContent =
            `${cutoff} game${cutoff === 1 ? "" : "s"}`;

    }


    /* --------------------------------------------------------
       CATEGORY 1
    --------------------------------------------------------- */

    const categoryOnePlayers =
        players.filter(

            player =>
                player.gamesPlayed
                >=
                cutoff

        );


    const categoryOneRanking =
    buildRanking(
        categoryOnePlayers
    );


renderFullCategoryStandings(
    categoryOneRanking,
    categoryOneAllPlayers
);


renderCategoryPodium(

        categoryOneRanking,

        categoryOneFirst,

        categoryOneSecond,

        categoryOneThird

    );


    /* --------------------------------------------------------
       CATEGORY 2

       Only players who have participated in at least one
       completed game are considered for monthly awards.

       Therefore players with zero games are not placed.
    --------------------------------------------------------- */

    const categoryTwoPlayers =
        players.filter(

            player =>

                player.gamesPlayed > 0

                &&

                player.gamesPlayed
                <
                cutoff

        );


    const categoryTwoRanking =
    buildRanking(
        categoryTwoPlayers
    );


renderFullCategoryStandings(
    categoryTwoRanking,
    categoryTwoAllPlayers
);


renderCategoryPodium(

        categoryTwoRanking,

        categoryTwoFirst,

        categoryTwoSecond,

        categoryTwoThird

    );

}

/* ============================================================
   FULL CATEGORY STANDINGS

   Shows every player currently belonging to the category.

   Example:

   #1 Hassan
   #1 Ahmed
   #1 Rifla
   #4 Shazeel
============================================================ */

function renderFullCategoryStandings(
    ranking,
    element
) {

    if (!element) {
        return;
    }


    if (
        ranking.length === 0
    ) {

        element.textContent =
            "No qualified players yet";

        return;

    }


    element.textContent =
        ranking
            .map(

                player =>
                    `#${player.rank} ${player.name}`

            )
            .join("  •  ");

}

/* ============================================================
   25. CATEGORY PODIUM

   Handles joint positions.

   Example:

   Rank 1 Hassan
   Rank 1 Ahmed
   Rank 3 Rifla

   Display:

   1st -> Hassan & Ahmed
   2nd -> —
   3rd -> Rifla
============================================================ */

function renderCategoryPodium(
    ranking,
    firstElement,
    secondElement,
    thirdElement
) {

    firstElement.textContent =
        getNamesAtRank(
            ranking,
            1
        );


    secondElement.textContent =
        getNamesAtRank(
            ranking,
            2
        );


    thirdElement.textContent =
        getNamesAtRank(
            ranking,
            3
        );

}


/* ============================================================
   26. NAMES AT SPECIFIC RANK
============================================================ */

function getNamesAtRank(
    ranking,
    rank
) {

    const players =
        ranking.filter(

            player =>
                player.rank === rank

        );


    if (
        players.length === 0
    ) {

        return "—";

    }


    return players
        .map(
            player =>
                player.name
        )
        .join(" & ");

}


/* ============================================================
   27. RESET CATEGORIES
============================================================ */

function resetCategories() {

    if (categoryCutoff) {

        categoryCutoff.textContent =
            "-";

    }


    if (categoryOneCutoff) {

        categoryOneCutoff.textContent =
            "half";

    }


    [

        categoryOneFirst,
        categoryOneSecond,
        categoryOneThird,
        categoryTwoFirst,
        categoryTwoSecond,
        categoryTwoThird

    ]
    .forEach(

        element => {

            if (element) {

                element.textContent =
                    "—";

            }

        }

    );

}


/* ============================================================
   28. FORMAT WIN %
============================================================ */

function formatPercentage(
    value
) {

    if (
        !Number.isFinite(value)
    ) {

        return "0%";

    }


    if (
        Number.isInteger(value)
    ) {

        return `${value}%`;

    }


    return `${value.toFixed(1)}%`;

}


/* ============================================================
   29. FORMAT POINTS

   Scores are integers only.
============================================================ */

function formatPoints(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0";

    }


    return new Intl.NumberFormat(
        "en-US"
    ).format(
        Math.round(number)
    );

}


/* ============================================================
   30. DATE FORMAT
============================================================ */

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "Date unavailable";

    }


    const date =
        new Date(
            Number(timestamp)
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return new Intl.DateTimeFormat(

        "en-GB",

        {

            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"

        }

    ).format(date);

}


/* ============================================================
   31. HTML ESCAPE
============================================================ */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}