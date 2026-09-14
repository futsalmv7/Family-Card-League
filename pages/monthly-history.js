/* ============================================================
   FAMILY CARD LEAGUE
   MONTHLY HISTORY PAGE

   Responsibilities:
   01. Firebase imports
   02. DOM references
   03. Load months
   04. Sort months
   05. Populate month selector
   06. Basic helpers

   More monthly-history logic will be added
   step by step.
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

const monthlyHistoryMonthSelect =
    document.getElementById(
        "monthlyHistoryMonthSelect"
    );


const monthlyHistoryLoadingState =
    document.getElementById(
        "monthlyHistoryLoadingState"
    );


const monthlyHistoryEmptyState =
    document.getElementById(
        "monthlyHistoryEmptyState"
    );


const monthlyHistoryContent =
    document.getElementById(
        "monthlyHistoryContent"
    );

const monthlyHistoryTitle =
    document.getElementById(
        "monthlyHistoryTitle"
    );


const monthlyHistoryStatus =
    document.getElementById(
        "monthlyHistoryStatus"
    );


const monthlyHistoryGameCount =
    document.getElementById(
        "monthlyHistoryGameCount"
    );


const monthlyHistoryPlayerCount =
    document.getElementById(
        "monthlyHistoryPlayerCount"
    );


const monthlyHistoryCutoff =
    document.getElementById(
        "monthlyHistoryCutoff"
    );

    const monthlyHistoryStandings =
    document.getElementById(
        "monthlyHistoryStandings"
    );

const monthlyHistoryCategory1 =
    document.getElementById(
        "monthlyHistoryCategory1"
    );


const monthlyHistoryCategory2 =
    document.getElementById(
        "monthlyHistoryCategory2"
    );


/* ============================================================
   03. PAGE STATE
============================================================ */

let availableMonths =
    [];


let selectedMonth =
    null;



/* ============================================================
   04. START PAGE
============================================================ */

loadAvailableMonths();



/* ============================================================
   05. LOAD AVAILABLE MONTHS
============================================================ */

async function loadAvailableMonths() {

    try {

        const monthsSnapshot =
            await get(
                ref(
                    database,
                    "months"
                )
            );


        availableMonths =
            [];


        if (
            monthsSnapshot.exists()
        ) {

            monthsSnapshot.forEach(

                (monthSnapshot) => {

                    const monthId =
                        monthSnapshot.key;


                    const monthData =
                        monthSnapshot.val()
                        || {};


                    availableMonths.push({

                        id:
                            monthId,

                        label:
                            getMonthLabel(
                                monthId,
                                monthData
                            ),

                        status:
                            getMonthStatus(
                                monthData
                            ),

                        data:
                            monthData

                    });

                }

            );

        }


        sortAvailableMonths();


        populateMonthSelector();


/*
   Automatically load the newest month.
*/

if (
    availableMonths.length > 0
) {

    loadSelectedMonth(
        availableMonths[0].id
    );

}


monthlyHistoryLoadingState.classList.add(
    "hidden"
);


        if (
    availableMonths.length === 0
) {

    monthlyHistoryEmptyState.classList.remove(
        "hidden"
    );


    monthlyHistoryContent.classList.add(
        "hidden"
    );

}

else {

    monthlyHistoryEmptyState.classList.add(
        "hidden"
    );


    monthlyHistoryContent.classList.remove(
        "hidden"
    );

}


        console.log(
            "Monthly history months loaded:",
            availableMonths.length
        );

    }

    catch (error) {

        console.error(
            "Unable to load monthly history:",
            error
        );


        monthlyHistoryLoadingState.classList.add(
            "hidden"
        );


        monthlyHistoryEmptyState.classList.remove(
            "hidden"
        );


        monthlyHistoryEmptyState.querySelector(
            "strong"
        ).textContent =
            "Unable to load monthly history";


        monthlyHistoryEmptyState.querySelector(
            "p"
        ).textContent =
            "Check the Firebase connection and try again.";

    }

}



/* ============================================================
   06. SORT MONTHS

   Month IDs use:

   YYYY-MM

   Example:

   2026-09
   2026-08
   2026-07

   String sorting works correctly with this format.
============================================================ */

function sortAvailableMonths() {

    availableMonths.sort(

        (monthA, monthB) =>

            String(
                monthB.id
            ).localeCompare(
                String(
                    monthA.id
                )
            )

    );

}



/* ============================================================
   07. POPULATE MONTH SELECTOR
============================================================ */

function populateMonthSelector() {

    monthlyHistoryMonthSelect.innerHTML =
        "";


    if (
        availableMonths.length === 0
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "No months available";


        monthlyHistoryMonthSelect.appendChild(
            option
        );


        monthlyHistoryMonthSelect.disabled =
            true;


        return;

    }


    monthlyHistoryMonthSelect.disabled =
        false;


    availableMonths.forEach(

        (month) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                month.id;


            option.textContent =
                `${month.label} • ${formatMonthStatus(
                    month.status
                )}`;


            monthlyHistoryMonthSelect.appendChild(
                option
            );

        }

    );


    /*
       Newest month is already first,
       so select it automatically.
    */

    monthlyHistoryMonthSelect.value =
    availableMonths[0].id;


/*
   Load another month when the
   selector changes.
*/

monthlyHistoryMonthSelect.addEventListener(

    "change",

    () => {

        loadSelectedMonth(
            monthlyHistoryMonthSelect.value
        );

    }

);

}



/* ============================================================
   08. GET MONTH LABEL
============================================================ */

function getMonthLabel(
    monthId,
    monthData
) {

    /*
       Preferred locations:

       1. months/{monthId}/info/label
       2. months/{monthId}/label
       3. create label from YYYY-MM
    */

    if (
        monthData?.info?.label
    ) {

        return monthData.info.label;

    }


    if (
        monthData?.label
    ) {

        return monthData.label;

    }


    return buildLabelFromMonthId(
        monthId
    );

}



/* ============================================================
   09. GET MONTH STATUS
============================================================ */

function getMonthStatus(
    monthData
) {

    /*
       Support both possible locations.

       We will standardize this later when
       month finalization is built in Admin.
    */

    return (
        monthData?.info?.status
        ||
        monthData?.status
        ||
        "ACTIVE"
    );

}



/* ============================================================
   10. BUILD LABEL FROM MONTH ID
============================================================ */

function buildLabelFromMonthId(
    monthId
) {

    const parts =
        String(
            monthId || ""
        ).split(
            "-"
        );


    if (
        parts.length !== 2
    ) {

        return (
            monthId
            ||
            "Unknown Month"
        );

    }


    const year =
        Number(
            parts[0]
        );


    const monthNumber =
        Number(
            parts[1]
        );


    if (
        !year
        ||
        monthNumber < 1
        ||
        monthNumber > 12
    ) {

        return monthId;

    }


    const date =
        new Date(
            year,
            monthNumber - 1,
            1
        );


    return date.toLocaleDateString(

        "en-GB",

        {

            month:
                "long",

            year:
                "numeric"

        }

    );

}



/* ============================================================
   11. FORMAT MONTH STATUS
============================================================ */

function formatMonthStatus(
    status
) {

    const normalizedStatus =
        String(
            status || ""
        )
        .trim()
        .toUpperCase();


    if (
        normalizedStatus === "FINALIZED"
    ) {

        return "Finalized";

    }


    if (
        normalizedStatus === "ARCHIVED"
    ) {

        return "Archived";

    }


    if (
        normalizedStatus === "ACTIVE"
    ) {

        return "Active";

    }


    return (
        normalizedStatus
        ||
        "Unknown"
    );

}

/* ============================================================
   12. LOAD SELECTED MONTH
============================================================ */

function loadSelectedMonth(
    monthId
) {

    selectedMonth =
        availableMonths.find(

            (month) =>
                month.id
                ===
                monthId

        )
        ||
        null;


    if (
        !selectedMonth
    ) {

        monthlyHistoryContent.classList.add(
            "hidden"
        );


        return;

    }


    renderMonthOverview(
        selectedMonth
    );

}



/* ============================================================
   13. RENDER MONTH OVERVIEW
============================================================ */

function renderMonthOverview(
    month
) {

    const monthData =
        month.data
        || {};


    const games =
        getMonthGames(
            monthData
        );


    const completedGames =
        games.filter(

            (game) =>
                game.status
                ===
                "COMPLETED"

        );


    const participantIds =
        getMonthlyParticipantIds(
            completedGames
        );


    const gamesPlayedByPlayer =
        getGamesPlayedByPlayer(
            completedGames
        );


    const categoryCutoff =
        calculateCategoryCutoff(
            gamesPlayedByPlayer
        );


    monthlyHistoryTitle.textContent =
        month.label;


    monthlyHistoryStatus.textContent =
        formatMonthStatus(
            month.status
        );


    monthlyHistoryGameCount.textContent =
        completedGames.length;


    monthlyHistoryPlayerCount.textContent =
        participantIds.size;


    monthlyHistoryCutoff.textContent =
        categoryCutoff > 0
            ? categoryCutoff
            : "—";

            const monthlyStandings =
    buildMonthlyStandings(
        completedGames
    );


renderMonthlyStandings(
    monthlyStandings
);

const monthlyCategories =
    buildMonthlyCategories(
        monthlyStandings,
        categoryCutoff
    );


renderMonthlyCategory(
    monthlyHistoryCategory1,
    monthlyCategories.category1,
    "No players qualify for Category 1 yet."
);


renderMonthlyCategory(
    monthlyHistoryCategory2,
    monthlyCategories.category2,
    "No players qualify for Category 2 yet."
);

    console.log(
        "Selected month:",
        month.id,
        {
            completedGames:
                completedGames.length,

            players:
                participantIds.size,

            categoryCutoff
        }
    );

}



/* ============================================================
   14. GET MONTH GAMES
============================================================ */

function getMonthGames(
    monthData
) {

    const games =
        monthData?.games
        || {};


    return Object.entries(
        games
    ).map(

        ([gameId, game]) => ({

            id:
                gameId,

            ...game

        })

    );

}



/* ============================================================
   15. GET GAME PLAYERS
============================================================ */

function getGamePlayers(
    game
) {

    if (
        !game?.players
    ) {

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
   16. MONTHLY PARTICIPANTS

   Only players who participated in at least
   one COMPLETED game are counted.
============================================================ */

function getMonthlyParticipantIds(
    completedGames
) {

    const participantIds =
        new Set();


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            gamePlayers.forEach(

                (player) => {

                    participantIds.add(
                        player.id
                    );

                }

            );

        }

    );


    return participantIds;

}



/* ============================================================
   17. GAMES PLAYED BY PLAYER
============================================================ */

function getGamesPlayedByPlayer(
    completedGames
) {

    const gamesPlayed =
        new Map();


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            gamePlayers.forEach(

                (player) => {

                    const currentCount =
                        gamesPlayed.get(
                            player.id
                        )
                        || 0;


                    gamesPlayed.set(
                        player.id,
                        currentCount + 1
                    );

                }

            );

        }

    );


    return gamesPlayed;

}



/* ============================================================
   18. CATEGORY CUTOFF

   Cutoff = ceil(
       highest number of completed games
       played by any player
       /
       2
   )

   Example:

   Maximum = 5 games
   Cutoff = ceil(5 / 2)
          = 3
============================================================ */

function calculateCategoryCutoff(
    gamesPlayedByPlayer
) {

    if (
        gamesPlayedByPlayer.size === 0
    ) {

        return 0;

    }


    const gameCounts =
        Array.from(
            gamesPlayedByPlayer.values()
        );


    const maximumGamesPlayed =
        Math.max(
            ...gameCounts
        );


    return Math.ceil(
        maximumGamesPlayed
        /
        2
    );

}

/* ============================================================
   19. BUILD MONTHLY STANDINGS

   Ranking rules:

   1. Total Points
   2. Win %
   3. Games Won
   4. Exact tie = joint rank
============================================================ */

function buildMonthlyStandings(
    completedGames
) {

    const statsMap =
        new Map();


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            const totals =
                getGameTotalsForStandings(
                    game,
                    gamePlayers
                );


            const winnerIds =
                getWinnerIdsForStandings(
                    game,
                    gamePlayers,
                    totals
                );


            gamePlayers.forEach(

                (player) => {

                    if (
                        !statsMap.has(
                            player.id
                        )
                    ) {

                        statsMap.set(

                            player.id,

                            {

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

                            }

                        );

                    }


                    const playerStats =
                        statsMap.get(
                            player.id
                        );


                    playerStats.gamesPlayed +=
                        1;


                    playerStats.totalPoints +=
                        Number(
                            totals[
                                player.id
                            ]
                            || 0
                        );


                    if (
                        winnerIds.includes(
                            player.id
                        )
                    ) {

                        playerStats.gamesWon +=
                            1;

                    }

                }

            );

        }

    );


    const standings =
        Array.from(
            statsMap.values()
        );


    standings.forEach(

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


    standings.sort(
        compareMonthlyStandings
    );


    assignMonthlyStandingsRanks(
        standings
    );


    return standings;

}



/* ============================================================
   20. MONTHLY STANDINGS SORT
============================================================ */

function compareMonthlyStandings(
    playerA,
    playerB
) {

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
   21. ASSIGN MONTHLY STANDINGS RANKS

   Competition ranking:

   1, 1, 1, 4
============================================================ */

function assignMonthlyStandingsRanks(
    standings
) {

    let previousPlayer =
        null;


    standings.forEach(

        (player, index) => {

            if (
                !previousPlayer
            ) {

                player.rank =
                    1;

            }

            else if (
                hasSameMonthlyStandingValues(
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
   22. SAME MONTHLY STANDING VALUES
============================================================ */

function hasSameMonthlyStandingValues(
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
   23. RENDER MONTHLY STANDINGS
============================================================ */

function renderMonthlyStandings(
    standings
) {

    monthlyHistoryStandings.innerHTML =
        "";


    if (
        standings.length === 0
    ) {

        monthlyHistoryStandings.innerHTML = `

            <div class="monthly-history-empty-list">
                No completed games for this month.
            </div>

        `;


        return;

    }


    standings.forEach(

        (player) => {

            const row =
                createMonthlyStandingRow(
                    player
                );


            monthlyHistoryStandings.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   24. CREATE MONTHLY STANDING ROW
============================================================ */

function createMonthlyStandingRow(
    player
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "monthly-history-row";


    row.innerHTML = `

        <div class="monthly-history-row-top">

            <div class="monthly-history-player">

                ${escapeMonthlyHistoryHTML(
                    player.name
                )}

            </div>


            <div class="monthly-history-rank">

                #${player.rank}

            </div>

        </div>


        <div class="monthly-history-row-stats">

            <div class="monthly-history-row-stat">

                <strong>
                    ${player.gamesPlayed}
                </strong>

                <span>
                    Played
                </span>

            </div>


            <div class="monthly-history-row-stat">

                <strong>
                    ${player.gamesWon}
                </strong>

                <span>
                    Won
                </span>

            </div>


            <div class="monthly-history-row-stat">

                <strong>
                    ${formatMonthlyWinPercentage(
                        player.winPercentage
                    )}%
                </strong>

                <span>
                    Win %
                </span>

            </div>


            <div class="monthly-history-row-stat">

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
   25. GET GAME TOTALS FOR STANDINGS
============================================================ */

function getGameTotalsForStandings(
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
        typeof game.finalTotals
        ===
        "object"
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
                        getMatchScoreForStandings(
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
   26. GET MATCH SCORE FOR STANDINGS
============================================================ */

function getMatchScoreForStandings(
    match,
    playerId
) {

    const scores =
        match.scores
        &&
        typeof match.scores
        ===
        "object"
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
   27. GET WINNER IDS FOR STANDINGS
============================================================ */

function getWinnerIdsForStandings(
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
            (player) =>
                player.id
        );

}



/* ============================================================
   28. FORMAT WIN %
============================================================ */

function formatMonthlyWinPercentage(
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
   29. SAFE MONTHLY HISTORY HTML
============================================================ */

function escapeMonthlyHistoryHTML(
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
   30. BUILD MONTHLY CATEGORIES
============================================================ */

function buildMonthlyCategories(
    monthlyStandings,
    categoryCutoff
) {

    if (
        categoryCutoff <= 0
    ) {

        return {

            category1:
                [],

            category2:
                []

        };

    }


    const category1 =
        monthlyStandings
            .filter(

                (player) =>

                    player.gamesPlayed
                    >=
                    categoryCutoff

            )
            .map(
                cloneMonthlyStanding
            );


    const category2 =
        monthlyStandings
            .filter(

                (player) =>

                    player.gamesPlayed > 0

                    &&

                    player.gamesPlayed
                    <
                    categoryCutoff

            )
            .map(
                cloneMonthlyStanding
            );


    /*
       Category rankings are independent.

       A player's overall monthly rank
       is NOT reused here.
    */

    category1.sort(
        compareMonthlyStandings
    );


    category2.sort(
        compareMonthlyStandings
    );


    assignMonthlyStandingsRanks(
        category1
    );


    assignMonthlyStandingsRanks(
        category2
    );


    return {

        category1,
        category2

    };

}



/* ============================================================
   31. CLONE MONTHLY STANDING
============================================================ */

function cloneMonthlyStanding(
    player
) {

    return {

        ...player,

        rank:
            null

    };

}



/* ============================================================
   32. RENDER MONTHLY CATEGORY
============================================================ */

function renderMonthlyCategory(
    container,
    standings,
    emptyMessage
) {

    container.innerHTML =
        "";


    if (
        standings.length === 0
    ) {

        container.innerHTML = `

            <div class="monthly-history-empty-list">

                ${escapeMonthlyHistoryHTML(
                    emptyMessage
                )}

            </div>

        `;


        return;

    }


    standings.forEach(

        (player) => {

            const row =
                createMonthlyStandingRow(
                    player
                );


            container.appendChild(
                row
            );

        }

    );

}