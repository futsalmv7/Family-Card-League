/* ============================================================
   FAMILY CARD LEAGUE
   PLAYER PROFILE PAGE

   Responsibilities:
   01. Firebase imports
   02. Read player ID from URL
   03. Load player
   04. Load active month
   05. Calculate current-month statistics
   06. Calculate lifetime statistics
   07. Calculate current-month rank
   08. Render profile
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
    get
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";



/* ============================================================
   02. DOM REFERENCES
============================================================ */

const playerProfileAvatar =
    document.getElementById(
        "playerProfileAvatar"
    );


const playerProfileName =
    document.getElementById(
        "playerProfileName"
    );


const playerProfileStatus =
    document.getElementById(
        "playerProfileStatus"
    );


const profileLoadingState =
    document.getElementById(
        "profileLoadingState"
    );


const profileErrorState =
    document.getElementById(
        "profileErrorState"
    );


const profileErrorMessage =
    document.getElementById(
        "profileErrorMessage"
    );


const playerProfileContent =
    document.getElementById(
        "playerProfileContent"
    );


const profileMonthLabel =
    document.getElementById(
        "profileMonthLabel"
    );


const profileMonthlyRank =
    document.getElementById(
        "profileMonthlyRank"
    );


const profileMonthlyGames =
    document.getElementById(
        "profileMonthlyGames"
    );


const profileMonthlyWins =
    document.getElementById(
        "profileMonthlyWins"
    );


const profileMonthlyWinPercentage =
    document.getElementById(
        "profileMonthlyWinPercentage"
    );


const profileMonthlyPoints =
    document.getElementById(
        "profileMonthlyPoints"
    );


const profileLifetimeGames =
    document.getElementById(
        "profileLifetimeGames"
    );


const profileLifetimeWins =
    document.getElementById(
        "profileLifetimeWins"
    );


const profileLifetimeWinPercentage =
    document.getElementById(
        "profileLifetimeWinPercentage"
    );


const profileLifetimeMonths =
    document.getElementById(
        "profileLifetimeMonths"
    );


const profileLifetimePoints =
    document.getElementById(
        "profileLifetimePoints"
    );


const profileInfoStatus =
    document.getElementById(
        "profileInfoStatus"
    );


const profileInfoAdded =
    document.getElementById(
        "profileInfoAdded"
    );

const profileGamesList =
    document.getElementById(
        "profileGamesList"
    );


const profileGamesEmptyState =
    document.getElementById(
        "profileGamesEmptyState"
    );

/* ============================================================
   03. URL PARAMETERS
============================================================ */

const urlParameters =
    new URLSearchParams(
        window.location.search
    );


const playerId =
    urlParameters.get(
        "player"
    );



/* ============================================================
   04. START PROFILE
============================================================ */

loadPlayerProfile();



/* ============================================================
   05. LOAD PLAYER PROFILE
============================================================ */

async function loadPlayerProfile() {

    if (!playerId) {

        showProfileError(
            "No player was selected."
        );

        return;

    }


    try {

        /*
           Load these at the same time:

           - selected player
           - all players
           - active month
           - all months

           We need all players to calculate current-month rank.
           We need all months for lifetime statistics.
        */

        const [
            playerSnapshot,
            playersSnapshot,
            activeMonthSnapshot,
            monthsSnapshot
        ] =
            await Promise.all([

                get(
                    ref(
                        database,
                        `players/${playerId}`
                    )
                ),

                get(
                    ref(
                        database,
                        "players"
                    )
                ),

                get(
                    ref(
                        database,
                        "settings/activeMonth"
                    )
                ),

                get(
                    ref(
                        database,
                        "months"
                    )
                )

            ]);


        if (
            !playerSnapshot.exists()
        ) {

            showProfileError(
                "This player does not exist."
            );

            return;

        }


        const player = {

            id:
                playerId,

            ...playerSnapshot.val()

        };


        const allPlayers =
            snapshotToPlayers(
                playersSnapshot
            );


        const activeMonth =
            activeMonthSnapshot.exists()
                ? activeMonthSnapshot.val()
                : null;


        const months =
            monthsSnapshot.exists()
                ? monthsSnapshot.val()
                : {};


        /*
           Basic player information
        */

        renderPlayerHeader(
            player
        );


        /*
           Current-month statistics
        */

        const currentMonthResult =
            calculateCurrentMonthStatistics(
                player,
                allPlayers,
                activeMonth,
                months
            );


        renderCurrentMonthStatistics(
            currentMonthResult,
            activeMonth
        );


        /*
           Lifetime statistics
        */

        const lifetimeResult =
            calculateLifetimeStatistics(
                player,
                months
            );


        renderLifetimeStatistics(
    lifetimeResult
);


/*
   Recent completed games
*/

const recentGames =
    buildPlayerRecentGames(
        player,
        months
    );


renderPlayerRecentGames(
    recentGames
);


/*
   Player information
*/

renderPlayerInformation(
    player
);


        profileLoadingState.classList.add(
            "hidden"
        );


        profileErrorState.classList.add(
            "hidden"
        );


        playerProfileContent.classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(
            "Unable to load player profile:",
            error
        );


        showProfileError(
            "The player profile could not be loaded. Check your Firebase connection."
        );

    }

}



/* ============================================================
   06. SNAPSHOT TO PLAYER ARRAY
============================================================ */

function snapshotToPlayers(
    snapshot
) {

    const players =
        [];


    if (
        !snapshot.exists()
    ) {

        return players;

    }


    snapshot.forEach(

        (childSnapshot) => {

            players.push({

                id:
                    childSnapshot.key,

                ...childSnapshot.val()

            });

        }

    );


    return players;

}



/* ============================================================
   07. CURRENT MONTH STATISTICS
============================================================ */

function calculateCurrentMonthStatistics(
    selectedPlayer,
    allPlayers,
    activeMonth,
    months
) {

    const emptyResult = {

        rank:
            null,

        gamesPlayed:
            0,

        gamesWon:
            0,

        winPercentage:
            0,

        totalPoints:
            0

    };


    if (
        !activeMonth
        ||
        !activeMonth.id
    ) {

        return emptyResult;

    }


    const month =
        months[
            activeMonth.id
        ];


    if (!month) {

        return emptyResult;

    }


    const games =
        month.games
        || {};


    const completedGames =
        Object.entries(
            games
        )

        .map(

            ([gameId, game]) => ({

                id:
                    gameId,

                ...game

            })

        )

        .filter(

            (game) =>
                game.status === "COMPLETED"

        );


    const allStats =
        calculateStatsForPlayers(
            allPlayers,
            completedGames
        );


    assignRanks(
        allStats
    );


    const selectedStats =
        allStats.find(

            (playerStats) =>
                playerStats.id
                ===
                selectedPlayer.id

        );


    return (
        selectedStats
        ||
        emptyResult
    );

}



/* ============================================================
   08. CALCULATE STATS FOR ALL PLAYERS
============================================================ */

function calculateStatsForPlayers(
    players,
    completedGames
) {

    const stats =
        players.map(

            (player) => ({

                id:
                    player.id,

                name:
                    player.name,

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


    const statsMap =
        new Map();


    stats.forEach(

        (playerStats) => {

            statsMap.set(
                playerStats.id,
                playerStats
            );

        }

    );


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            const totals =
                getGameTotals(
                    game,
                    gamePlayers
                );


            const winners =
                getWinnerIds(
                    game,
                    gamePlayers,
                    totals
                );


            gamePlayers.forEach(

                (gamePlayer) => {

                    const playerStats =
                        statsMap.get(
                            gamePlayer.id
                        );


                    if (!playerStats) {
                        return;
                    }


                    playerStats.gamesPlayed +=
                        1;


                    playerStats.totalPoints +=
                        Number(
                            totals[
                                gamePlayer.id
                            ]
                            || 0
                        );


                    if (
                        winners.includes(
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


    stats.forEach(

        (playerStats) => {

            playerStats.winPercentage =
                playerStats.gamesPlayed > 0
                    ? (
                        playerStats.gamesWon
                        /
                        playerStats.gamesPlayed
                        *
                        100
                    )
                    : 0;

        }

    );


    stats.sort(
        comparePlayerStats
    );


    return stats;

}



/* ============================================================
   09. MONTHLY RANKING

   Ranking rules:

   1. Total points
   2. Win %
   3. Games won
   4. Exact tie = joint position

   Competition ranking:
   1, 1, 1, 4
============================================================ */

function assignRanks(
    playerStats
) {

    let previousRankedPlayer =
        null;


    playerStats.forEach(

        (player, index) => {

            if (
                player.gamesPlayed === 0
            ) {

                player.rank =
                    null;

                return;

            }


            if (
                !previousRankedPlayer
            ) {

                player.rank =
                    1;

            }

            else if (
                hasSameRankingValues(
                    player,
                    previousRankedPlayer
                )
            ) {

                player.rank =
                    previousRankedPlayer.rank;

            }

            else {

                player.rank =
                    index + 1;

            }


            previousRankedPlayer =
                player;

        }

    );

}



/* ============================================================
   10. PLAYER STAT SORT
============================================================ */

function comparePlayerStats(
    playerA,
    playerB
) {

    /*
       Players who actually played are ranked
       before players with zero games.
    */

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


    return String(
        playerA.name || ""
    ).localeCompare(
        String(
            playerB.name || ""
        )
    );

}



/* ============================================================
   11. SAME RANK CHECK
============================================================ */

function hasSameRankingValues(
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
   12. LIFETIME STATISTICS

   Only COMPLETED games count.

   ACTIVE and CANCELLED games are ignored.
============================================================ */

function calculateLifetimeStatistics(
    selectedPlayer,
    months
) {

    let gamesPlayed =
        0;


    let gamesWon =
        0;


    let totalPoints =
        0;


    const monthsPlayed =
        new Set();


    Object.entries(
        months || {}
    ).forEach(

        ([monthId, month]) => {

            const games =
                month?.games
                || {};


            Object.entries(
                games
            ).forEach(

                ([gameId, game]) => {

                    if (
                        game?.status
                        !==
                        "COMPLETED"
                    ) {

                        return;

                    }


                    const gamePlayers =
                        getGamePlayers(
                            game
                        );


                    const isParticipant =
                        gamePlayers.some(

                            (gamePlayer) =>
                                gamePlayer.id
                                ===
                                selectedPlayer.id

                        );


                    if (
                        !isParticipant
                    ) {

                        return;

                    }


                    const totals =
                        getGameTotals(
                            game,
                            gamePlayers
                        );


                    const winners =
                        getWinnerIds(
                            game,
                            gamePlayers,
                            totals
                        );


                    gamesPlayed +=
                        1;


                    totalPoints +=
                        Number(
                            totals[
                                selectedPlayer.id
                            ]
                            || 0
                        );


                    if (
                        winners.includes(
                            selectedPlayer.id
                        )
                    ) {

                        gamesWon +=
                            1;

                    }


                    monthsPlayed.add(
                        monthId
                    );

                }

            );

        }

    );


    const winPercentage =
        gamesPlayed > 0
            ? (
                gamesWon
                /
                gamesPlayed
                *
                100
            )
            : 0;


    return {

        gamesPlayed,

        gamesWon,

        totalPoints,

        winPercentage,

        monthsPlayed:
            monthsPlayed.size

    };

}



/* ============================================================
   13. GET GAME PLAYERS
============================================================ */

function getGamePlayers(
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
   14. GET GAME TOTALS

   Prefer saved finalTotals.

   If unavailable, calculate from individual matches.
============================================================ */

function getGameTotals(
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


    /*
       Completed games normally already contain
       finalTotals.
    */

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
                    Number(
                        score || 0
                    );

            }

        );


        return totals;

    }


    /*
       Fallback:
       calculate totals from saved matches.
    */

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
                        getMatchScore(
                            match,
                            player.id
                        );

                }

            );

        }

    );


    return totals;

}



/* ============================================================
   15. GET MATCH SCORE
============================================================ */

function getMatchScore(
    match,
    playerId
) {

    const scores =
        match.scores
        &&
        typeof match.scores === "object"
            ? match.scores
            : match;


    if (
        scores[playerId]
        !==
        undefined
    ) {

        return Number(
            scores[playerId]
            ||
            0
        );

    }


    return 0;

}



/* ============================================================
   16. GET WINNER IDS

   Prefer saved winners.

   Otherwise determine winner from highest game total.
============================================================ */

function getWinnerIds(
    game,
    gamePlayers,
    totals
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
                        typeof winner
                        ===
                        "string"
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


    const highestScore =
        Math.max(

            ...gamePlayers.map(

                (player) =>
                    Number(
                        totals[player.id]
                        ||
                        0
                    )

            )

        );


    return gamePlayers
        .filter(

            (player) =>

                Number(
                    totals[player.id]
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
   17. RENDER HEADER
============================================================ */

function renderPlayerHeader(
    player
) {

    playerProfileAvatar.textContent =
        getInitials(
            player.name
        );


    playerProfileName.textContent =
        player.name
        ||
        "Player";


    const statusText =
        player.active
            ? "Active"
            : "Inactive";


    playerProfileStatus.textContent =
        statusText;


    document.title =
        `${player.name || "Player"} | Family Card League`;

}



/* ============================================================
   18. RENDER CURRENT MONTH
============================================================ */

function renderCurrentMonthStatistics(
    stats,
    activeMonth
) {

    profileMonthLabel.textContent =
        activeMonth?.label
        ||
        activeMonth?.id
        ||
        "No active month";


    profileMonthlyRank.textContent =
        stats.rank
            ? `#${stats.rank}`
            : "—";


    profileMonthlyGames.textContent =
        stats.gamesPlayed;


    profileMonthlyWins.textContent =
        stats.gamesWon;


    profileMonthlyWinPercentage.textContent =
        `${formatPercentage(
            stats.winPercentage
        )}%`;


    profileMonthlyPoints.textContent =
        stats.totalPoints;

}



/* ============================================================
   19. RENDER LIFETIME
============================================================ */

function renderLifetimeStatistics(
    stats
) {

    profileLifetimeGames.textContent =
        stats.gamesPlayed;


    profileLifetimeWins.textContent =
        stats.gamesWon;


    profileLifetimeWinPercentage.textContent =
        `${formatPercentage(
            stats.winPercentage
        )}%`;


    profileLifetimeMonths.textContent =
        stats.monthsPlayed;


    profileLifetimePoints.textContent =
        stats.totalPoints;

}



/* ============================================================
   20. RENDER PLAYER INFORMATION
============================================================ */

function renderPlayerInformation(
    player
) {

    profileInfoStatus.textContent =
        player.active
            ? "Active"
            : "Inactive";


    profileInfoAdded.textContent =
        formatDate(
            player.createdAt
        );

}



/* ============================================================
   21. SHOW PROFILE ERROR
============================================================ */

function showProfileError(
    message
) {

    profileLoadingState.classList.add(
        "hidden"
    );


    playerProfileContent.classList.add(
        "hidden"
    );


    profileErrorMessage.textContent =
        message;


    profileErrorState.classList.remove(
        "hidden"
    );

}



/* ============================================================
   22. FORMAT WIN %
============================================================ */

function formatPercentage(
    value
) {

    const number =
        Number(
            value || 0
        );


    if (
        Number.isInteger(
            number
        )
    ) {

        return String(
            number
        );

    }


    return number.toFixed(
        1
    );

}



/* ============================================================
   23. FORMAT DATE
============================================================ */

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "Unknown";

    }


    const date =
        new Date(
            timestamp
        );


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
   24. PLAYER INITIALS
============================================================ */

function getInitials(
    name
) {

    const cleanName =
        String(
            name || ""
        )
        .trim()
        .replace(
            /\s+/g,
            " "
        );


    if (!cleanName) {

        return "?";

    }


    const words =
        cleanName.split(
            " "
        );


    if (
        words.length === 1
    ) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0)
        +
        words[
            words.length - 1
        ].charAt(0)
    ).toUpperCase();

}

/* ============================================================
   25. BUILD PLAYER RECENT GAMES

   Only COMPLETED games are included.

   ACTIVE and CANCELLED games are ignored.
============================================================ */

function buildPlayerRecentGames(
    selectedPlayer,
    months
) {

    const recentGames =
        [];


    Object.entries(
        months || {}
    ).forEach(

        ([monthId, month]) => {

            const games =
                month?.games
                || {};


            Object.entries(
                games
            ).forEach(

                ([gameId, game]) => {

                    /*
                       Ignore anything that is not completed.
                    */

                    if (
                        game?.status
                        !==
                        "COMPLETED"
                    ) {

                        return;

                    }


                    const gamePlayers =
                        getGamePlayers(
                            game
                        );


                    /*
                       Check whether this player
                       actually participated.
                    */

                    const participated =
                        gamePlayers.some(

                            (gamePlayer) =>
                                gamePlayer.id
                                ===
                                selectedPlayer.id

                        );


                    if (
                        !participated
                    ) {

                        return;

                    }


                    const totals =
                        getGameTotals(
                            game,
                            gamePlayers
                        );


                    const winnerIds =
                        getWinnerIds(
                            game,
                            gamePlayers,
                            totals
                        );


                    const playerScore =
    Number(
        totals[
            selectedPlayer.id
        ]
        || 0
    );


const playerPosition =
    getPlayerGamePosition(
        selectedPlayer.id,
        gamePlayers,
        totals
    );


const playerIsWinner =
    winnerIds.includes(
        selectedPlayer.id
    );


                    /*
                       If more than one winner exists,
                       this is a tied win.
                    */

                    let result =
                        "LOSS";


                    if (
                        playerIsWinner
                        &&
                        winnerIds.length > 1
                    ) {

                        result =
                            "TIED WIN";

                    }

                    else if (
                        playerIsWinner
                    ) {

                        result =
                            "WIN";

                    }


                    recentGames.push({

                        id:
                            gameId,

                        monthId,

                        monthLabel:
                            game.monthLabel
                            ||
                            month?.info?.label
                            ||
                            monthId,

                        gameNumber:
                            game.gameNumber
                            ||
                            0,

                        completedAt:
                            game.completedAt
                            ||
                            game.updatedAt
                            ||
                            game.createdAt
                            ||
                            0,

                        score:
    playerScore,

position:
    playerPosition,

result,

playerCount:
    gamePlayers.length

                    });

                }

            );

        }

    );


    /*
       Newest completed game first.

       completedAt is preferred.

       If two games have the same timestamp,
       the larger game number comes first.
    */

    recentGames.sort(

        (gameA, gameB) => {

            if (
                gameB.completedAt
                !==
                gameA.completedAt
            ) {

                return (
                    gameB.completedAt
                    -
                    gameA.completedAt
                );

            }


            return (
                gameB.gameNumber
                -
                gameA.gameNumber
            );

        }

    );


    return recentGames;

}



/* ============================================================
   26. RENDER PLAYER RECENT GAMES
============================================================ */

function renderPlayerRecentGames(
    games
) {

    profileGamesList.innerHTML =
        "";


    if (
        games.length === 0
    ) {

        profileGamesList.classList.add(
            "hidden"
        );


        profileGamesEmptyState.classList.remove(
            "hidden"
        );


        return;

    }


    profileGamesEmptyState.classList.add(
        "hidden"
    );


    profileGamesList.classList.remove(
        "hidden"
    );


    /*
       Show the 10 most recent completed games.

       We can add a full-history button later
       if the family ends up having many games.
    */

    games
        .slice(
            0,
            10
        )
        .forEach(

            (game) => {

                const card =
                    createPlayerRecentGameCard(
                        game
                    );


                profileGamesList.appendChild(
                    card
                );

            }

        );

}



/* ============================================================
   27. CREATE RECENT GAME CARD
============================================================ */

function createPlayerRecentGameCard(
    game
) {

    const card =
        document.createElement(
            "a"
        );


    card.className =
        "profile-game-card";


    /*
       Link to our existing Game Details page.
    */

    card.href =
        `game-details.html?month=${encodeURIComponent(
            game.monthId
        )}&game=${encodeURIComponent(
            game.id
        )}`;


    const resultClass =
        getRecentGameResultClass(
            game.result
        );


    card.innerHTML = `

        <div class="profile-game-card-top">

            <div>

                <strong class="profile-game-number">
                    Game #${escapeProfileGameHTML(
                        game.gameNumber
                    )}
                </strong>

                <div class="profile-game-date">
                    ${escapeProfileGameHTML(
                        game.monthLabel
                    )}
                    •
                    ${escapeProfileGameHTML(
                        formatRecentGameDate(
                            game.completedAt
                        )
                    )}
                </div>

            </div>


            <span
                class="profile-game-result ${resultClass}"
            >
                ${escapeProfileGameHTML(
                    game.result
                )}
            </span>

        </div>


        <div class="profile-game-card-bottom">

            <div class="profile-game-stat">

                <strong>
                    ${escapeProfileGameHTML(
                        game.score
                    )}
                </strong>

                <span>
                    Score
                </span>

            </div>


            <div class="profile-game-stat">

    <strong>
        #${escapeProfileGameHTML(
            game.position
        )}
    </strong>

    <span>
        Position
    </span>

</div>


            <div class="profile-game-stat">

                <strong>
                    ${escapeProfileGameHTML(
                        game.playerCount
                    )}
                </strong>

                <span>
                    Players
                </span>

            </div>

        </div>

    `;


    return card;

}



/* ============================================================
   28. RECENT GAME RESULT CLASS
============================================================ */

function getRecentGameResultClass(
    result
) {

    if (
        result === "WIN"
    ) {

        return "win";

    }


    if (
        result === "TIED WIN"
    ) {

        return "tie";

    }


    return "loss";

}



/* ============================================================
   29. RECENT GAME DATE
============================================================ */

function formatRecentGameDate(
    timestamp
) {

    if (!timestamp) {

        return "Unknown date";

    }


    const date =
        new Date(
            timestamp
        );


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
   30. SAFE RECENT GAME HTML
============================================================ */

function escapeProfileGameHTML(
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

/* ============================================================
   31. PLAYER POSITION IN COMPLETED GAME

   Uses competition ranking:

   1, 1, 3, 4

   Players with the same total receive
   the same finishing position.
============================================================ */

function getPlayerGamePosition(
    playerId,
    gamePlayers,
    totals
) {

    const standings =
        gamePlayers.map(

            (player) => ({

                id:
                    player.id,

                score:
                    Number(
                        totals[player.id]
                        || 0
                    ),

                position:
                    null

            })

        );


    standings.sort(

        (playerA, playerB) =>

            playerB.score
            -
            playerA.score

    );


    let previousPlayer =
        null;


    standings.forEach(

        (player, index) => {

            if (
                !previousPlayer
            ) {

                player.position =
                    1;

            }

            else if (
                player.score
                ===
                previousPlayer.score
            ) {

                player.position =
                    previousPlayer.position;

            }

            else {

                player.position =
                    index + 1;

            }


            previousPlayer =
                player;

        }

    );


    const selectedStanding =
        standings.find(

            (player) =>
                player.id
                ===
                playerId

        );


    return (
        selectedStanding?.position
        || "—"
    );

}