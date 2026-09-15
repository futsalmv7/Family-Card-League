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

    const monthlyHistoryRecords =
    document.getElementById(
        "monthlyHistoryRecords"
    );

const monthlyHistoryGames =
    document.getElementById(
        "monthlyHistoryGames"
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

                String(
                    game.status
                    ||
                    ""
                ).toUpperCase()
                ===
                "COMPLETED"

        );


    const normalizedStatus =
        String(
            month.status
            ||
            ""
        ).toUpperCase();


    const finalizedSnapshot =
        monthData?.finalizedSnapshot
        ||
        null;


    /*
       ---------------------------------------------------------
       FINALIZED MONTH

       Once a month is finalized, official standings,
       categories, cutoff and records must come from
       the frozen finalizedSnapshot.

       They must NOT be recalculated from raw games.
       ---------------------------------------------------------
    */

    if (
        normalizedStatus ===
        "FINALIZED"
        &&
        finalizedSnapshot
    ) {

        const frozenStandings =
            normalizeFinalizedMonthlyStandings(
                finalizedSnapshot.standings
            );


        const frozenCategory1 =
            normalizeFinalizedMonthlyStandings(
                finalizedSnapshot?.categories?.category1
            );


        const frozenCategory2 =
            normalizeFinalizedMonthlyStandings(
                finalizedSnapshot?.categories?.category2
            );


        const frozenRecords =
            finalizedSnapshot.records
            ||
            {};


        const frozenGameCount =
            Number(
                finalizedSnapshot.gameCount
                ??
                completedGames.length
            );


        const frozenPlayerCount =
            Number(
                finalizedSnapshot.playerCount
                ??
                0
            );


        const frozenCutoff =
            Number(
                finalizedSnapshot.categoryCutoff
                ??
                0
            );


        monthlyHistoryTitle.textContent =
            finalizedSnapshot.monthLabel
            ||
            month.label;


        monthlyHistoryStatus.textContent =
            "Finalized";


        monthlyHistoryGameCount.textContent =
            frozenGameCount;


        monthlyHistoryPlayerCount.textContent =
            frozenPlayerCount;


        monthlyHistoryCutoff.textContent =
            frozenCutoff > 0
                ? frozenCutoff
                : "—";


        renderMonthlyStandings(
            frozenStandings
        );


        renderMonthlyCategory(
            monthlyHistoryCategory1,
            frozenCategory1,
            "No players qualified for Category 1."
        );


        renderMonthlyCategory(
            monthlyHistoryCategory2,
            frozenCategory2,
            "No players qualified for Category 2."
        );


        renderMonthlyRecords(
            frozenRecords
        );


        /*
           Individual completed games remain linked
           to the original game data.

           The official month results above are frozen.
        */

        renderMonthlyGames(
            completedGames,
            month.id
        );


        console.log(
            "Finalized month loaded from frozen snapshot:",
            month.id,
            {
                games:
                    frozenGameCount,

                players:
                    frozenPlayerCount,

                categoryCutoff:
                    frozenCutoff,

                standings:
                    frozenStandings.length,

                category1:
                    frozenCategory1.length,

                category2:
                    frozenCategory2.length
            }
        );


        return;

    }


    /*
       ---------------------------------------------------------
       ACTIVE MONTH

       Active months continue to calculate everything
       dynamically from COMPLETED games.

       ACTIVE games are excluded.
       ---------------------------------------------------------
    */

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


    const monthlyStandings =
        buildMonthlyStandings(
            completedGames
        );


    const monthlyCategories =
        buildMonthlyCategories(
            monthlyStandings,
            categoryCutoff
        );


    const monthlyRecords =
        buildMonthlyRecords(
            completedGames,
            monthlyStandings
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


    renderMonthlyStandings(
        monthlyStandings
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


    renderMonthlyRecords(
        monthlyRecords
    );


    renderMonthlyGames(
        completedGames,
        month.id
    );


    console.log(
        "Active month calculated from completed games:",
        month.id,
        {
            completedGames:
                completedGames.length,

            players:
                participantIds.size,

            categoryCutoff:
                categoryCutoff
        }
    );

}

/* ============================================================
   NORMALIZE FINALIZED MONTHLY STANDINGS

   Firebase may return a saved array as:
   - a JavaScript array
   - an object with numeric keys

   Also normalizes the Admin snapshot field names
   into the field names Monthly History already uses.
============================================================ */

function normalizeFinalizedMonthlyStandings(
    standings
) {

    let values =
        [];


    if (
        Array.isArray(
            standings
        )
    ) {

        values =
            standings.filter(
                Boolean
            );

    }

    else if (
        standings
        &&
        typeof standings ===
            "object"
    ) {

        values =
            Object.values(
                standings
            ).filter(
                Boolean
            );

    }


    return values.map(

        (player) => ({

            id:
                String(
                    player.playerId
                    ||
                    player.id
                    ||
                    ""
                ),

            name:
                String(
                    player.playerName
                    ||
                    player.name
                    ||
                    "Unknown Player"
                ),

            gamesPlayed:
                Number(
                    player.gamesPlayed
                    ||
                    0
                ),

            gamesWon:
                Number(
                    player.gamesWon
                    ||
                    0
                ),

            winPercentage:
                Number(
                    player.winPercentage
                    ||
                    0
                ),

            totalPoints:
    Number(
        player.totalPoints
        ??
        player.points
        ??
        0
    ),

averagePoints:
    getFinalizedAveragePoints(
        player
    ),

rank:
    Number(
        player.rank
        ||
        0
    )

        })

    );

}

/* ============================================================
   FINALIZED SNAPSHOT AVERAGE POINTS

   New finalized snapshots may store averagePoints directly.

   Older snapshots may not contain averagePoints.
   For those snapshots, Average Points can safely be derived
   from the already-frozen Total Points and Games Played.

   This does NOT recalculate the month from raw games and
   does NOT change the saved frozen rank.
============================================================ */

function getFinalizedAveragePoints(
    player
) {

    const savedAverage =
        Number(
            player.averagePoints
        );


    if (
        Number.isFinite(
            savedAverage
        )
        &&
        player.averagePoints
        !==
        undefined
        &&
        player.averagePoints
        !==
        null
    ) {

        return savedAverage;

    }


    const totalPoints =
        Number(
            player.totalPoints
            ??
            player.points
            ??
            0
        );


    const gamesPlayed =
        Number(
            player.gamesPlayed
            ??
            0
        );


    if (
        gamesPlayed <= 0
    ) {

        return 0;

    }


    return (
        totalPoints
        /
        gamesPlayed
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

averagePoints:
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

        if (
            player.gamesPlayed > 0
        ) {

            player.averagePoints =
                player.totalPoints
                /
                player.gamesPlayed;


            player.winPercentage =
                (
                    player.gamesWon
                    /
                    player.gamesPlayed
                    *
                    100
                );

        }

        else {

            player.averagePoints =
                0;


            player.winPercentage =
                0;

        }

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

    /*
       1. Average Points
    */

    if (
        playerB.averagePoints
        !==
        playerA.averagePoints
    ) {

        return (
            playerB.averagePoints
            -
            playerA.averagePoints
        );

    }


    /*
       2. Win %
    */

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


    /*
       3. Games Won
    */

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


    /*
       Alphabetical order only keeps
       exact ties displayed consistently.

       It does NOT break the joint rank.
    */

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
        playerA.averagePoints
        ===
        playerB.averagePoints

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


    <div class="monthly-history-row-stat monthly-history-average-stat">

        <strong>
            ${formatMonthlyAveragePoints(
                player.averagePoints
            )}
        </strong>

        <span>
            Avg
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
   FORMAT AVERAGE POINTS
============================================================ */

function formatMonthlyAveragePoints(
    value
) {

    const number =
        Number(
            value || 0
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "0";

    }


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

/* ============================================================
   33. BUILD MONTHLY RECORDS
============================================================ */

function buildMonthlyRecords(
    completedGames,
    monthlyStandings
) {

    const records = {

        highestSingleMatch:
            null,

        lowestSingleMatch:
            null,

        highestGameTotal:
            null,

        lowestGameTotal:
            null

    };


    const standingsByPlayer =
        new Map();


    monthlyStandings.forEach(

        (player) => {

            standingsByPlayer.set(
                player.id,
                player
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
                getGameTotalsForStandings(
                    game,
                    gamePlayers
                );


            /*
               COMPLETE GAME TOTAL RECORDS
            */

            gamePlayers.forEach(

                (player) => {

                    const score =
                        Number(
                            totals[player.id]
                            || 0
                        );


                    const candidate = {

                        playerId:
                            player.id,

                        playerName:
                            player.name,

                        score,

                        gameNumber:
                            game.gameNumber
                            || "—",

                        matchNumber:
                            null,

                        date:
                            game.completedAt
                            ||
                            game.createdAt
                            ||
                            null

                    };


                    records.highestGameTotal =
                        chooseRecordCandidate(
                            records.highestGameTotal,
                            candidate,
                            "HIGH",
                            standingsByPlayer
                        );


                    records.lowestGameTotal =
                        chooseRecordCandidate(
                            records.lowestGameTotal,
                            candidate,
                            "LOW",
                            standingsByPlayer
                        );

                }

            );


            /*
               SINGLE MATCH RECORDS
            */

            if (
                !game.matches
            ) {

                return;

            }


            Object.entries(
                game.matches
            ).forEach(

                ([matchKey, match]) => {

                    if (
                        !match
                    ) {

                        return;

                    }


                    const matchNumber =
                        Number(
                            match.matchNumber
                            ||
                            match.number
                            ||
                            matchKey
                        );


                    gamePlayers.forEach(

                        (player) => {

                            const score =
                                getMatchScoreForStandings(
                                    match,
                                    player.id
                                );


                            const candidate = {

                                playerId:
                                    player.id,

                                playerName:
                                    player.name,

                                score,

                                gameNumber:
                                    game.gameNumber
                                    || "—",

                                matchNumber:
                                    Number.isFinite(
                                        matchNumber
                                    )
                                        ? matchNumber
                                        : matchKey,

                                date:
                                    game.completedAt
                                    ||
                                    game.createdAt
                                    ||
                                    null

                            };


                            records.highestSingleMatch =
                                chooseRecordCandidate(
                                    records.highestSingleMatch,
                                    candidate,
                                    "HIGH",
                                    standingsByPlayer
                                );


                            records.lowestSingleMatch =
                                chooseRecordCandidate(
                                    records.lowestSingleMatch,
                                    candidate,
                                    "LOW",
                                    standingsByPlayer
                                );

                        }

                    );

                }

            );

        }

    );


    return records;

}



/* ============================================================
   34. CHOOSE RECORD CANDIDATE

   Main comparison:
   HIGH = bigger score wins
   LOW  = smaller score wins

   Tie-break:
   1. Higher monthly Win %
   2. More Games Won
   3. Alphabetical player name
============================================================ */

function chooseRecordCandidate(
    currentRecord,
    candidate,
    direction,
    standingsByPlayer
) {

    if (
        !currentRecord
    ) {

        return candidate;

    }


    if (
        direction === "HIGH"
    ) {

        if (
            candidate.score
            >
            currentRecord.score
        ) {

            return candidate;

        }


        if (
            candidate.score
            <
            currentRecord.score
        ) {

            return currentRecord;

        }

    }

    else {

        if (
            candidate.score
            <
            currentRecord.score
        ) {

            return candidate;

        }


        if (
            candidate.score
            >
            currentRecord.score
        ) {

            return currentRecord;

        }

    }


    return chooseRecordTieBreaker(
        currentRecord,
        candidate,
        standingsByPlayer
    );

}



/* ============================================================
   35. RECORD TIE-BREAK
============================================================ */

function chooseRecordTieBreaker(
    currentRecord,
    candidate,
    standingsByPlayer
) {

    const currentStats =
        standingsByPlayer.get(
            currentRecord.playerId
        )
        ||
        {};


    const candidateStats =
        standingsByPlayer.get(
            candidate.playerId
        )
        ||
        {};


    const currentWinPercentage =
        Number(
            currentStats.winPercentage
            || 0
        );


    const candidateWinPercentage =
        Number(
            candidateStats.winPercentage
            || 0
        );


    if (
        candidateWinPercentage
        >
        currentWinPercentage
    ) {

        return candidate;

    }


    if (
        candidateWinPercentage
        <
        currentWinPercentage
    ) {

        return currentRecord;

    }


    const currentWins =
        Number(
            currentStats.gamesWon
            || 0
        );


    const candidateWins =
        Number(
            candidateStats.gamesWon
            || 0
        );


    if (
        candidateWins
        >
        currentWins
    ) {

        return candidate;

    }


    if (
        candidateWins
        <
        currentWins
    ) {

        return currentRecord;

    }


    const nameComparison =
        String(
            candidate.playerName
            || ""
        ).localeCompare(
            String(
                currentRecord.playerName
                || ""
            )
        );


    if (
        nameComparison < 0
    ) {

        return candidate;

    }


    return currentRecord;

}



/* ============================================================
   36. RENDER MONTHLY RECORDS
============================================================ */

function renderMonthlyRecords(
    records
) {

    monthlyHistoryRecords.innerHTML =
        "";


    const recordCards = [

        {

            label:
                "Highest Single Match",

            record:
                records.highestSingleMatch,

            includeMatch:
                true

        },

        {

            label:
                "Lowest Single Match",

            record:
                records.lowestSingleMatch,

            includeMatch:
                true

        },

        {

            label:
                "Highest Game Total",

            record:
                records.highestGameTotal,

            includeMatch:
                false

        },

        {

            label:
                "Lowest Game Total",

            record:
                records.lowestGameTotal,

            includeMatch:
                false

        }

    ];


    recordCards.forEach(

        (recordInfo) => {

            monthlyHistoryRecords.appendChild(

                createMonthlyRecordCard(
                    recordInfo.label,
                    recordInfo.record,
                    recordInfo.includeMatch
                )

            );

        }

    );

}



/* ============================================================
   37. CREATE RECORD CARD
============================================================ */

function createMonthlyRecordCard(
    label,
    record,
    includeMatch
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "monthly-history-record-card";


    if (
        !record
    ) {

        card.innerHTML = `

            <span class="monthly-history-record-label">
                ${escapeMonthlyHistoryHTML(label)}
            </span>

            <strong class="monthly-history-record-score">
                —
            </strong>

            <div class="monthly-history-record-player">
                No record yet
            </div>

        `;


        return card;

    }


    const gameText =
        `Game #${record.gameNumber}`;


    const matchText =
        includeMatch
        &&
        record.matchNumber !== null

            ? ` • Match #${record.matchNumber}`

            : "";


    const dateText =
        formatMonthlyRecordDate(
            record.date
        );


    card.innerHTML = `

        <span class="monthly-history-record-label">

            ${escapeMonthlyHistoryHTML(
                label
            )}

        </span>


        <strong class="monthly-history-record-score">

            ${record.score}

        </strong>


        <div class="monthly-history-record-player">

            ${escapeMonthlyHistoryHTML(
                record.playerName
            )}

        </div>


        <div class="monthly-history-record-meta">

            ${escapeMonthlyHistoryHTML(
                gameText
                +
                matchText
            )}

            ${
                dateText
                    ? ` • ${escapeMonthlyHistoryHTML(
                        dateText
                    )}`
                    : ""
            }

        </div>

    `;


    return card;

}



/* ============================================================
   38. FORMAT RECORD DATE
============================================================ */

function formatMonthlyRecordDate(
    timestamp
) {

    const numericTimestamp =
        Number(
            timestamp
        );


    if (
        !numericTimestamp
        ||
        !Number.isFinite(
            numericTimestamp
        )
    ) {

        return "";

    }


    const date =
        new Date(
            numericTimestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleDateString(

        "en-GB",

        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }

    );

}

/* ============================================================
   39. RENDER MONTHLY COMPLETED GAMES
============================================================ */

function renderMonthlyGames(
    completedGames,
    monthId
) {

    monthlyHistoryGames.innerHTML =
        "";


    if (
        completedGames.length === 0
    ) {

        monthlyHistoryGames.innerHTML = `

            <div class="monthly-history-empty-list">

                No completed games for this month.

            </div>

        `;


        return;

    }


    /*
       Newest / highest game number first.
    */

    const sortedGames =
        [...completedGames]
            .sort(

                (gameA, gameB) => {

                    const gameNumberA =
                        Number(
                            gameA.gameNumber || 0
                        );


                    const gameNumberB =
                        Number(
                            gameB.gameNumber || 0
                        );


                    if (
                        gameNumberB
                        !==
                        gameNumberA
                    ) {

                        return (
                            gameNumberB
                            -
                            gameNumberA
                        );

                    }


                    return (

                        Number(
                            gameB.completedAt
                            ||
                            gameB.createdAt
                            ||
                            0
                        )

                        -

                        Number(
                            gameA.completedAt
                            ||
                            gameA.createdAt
                            ||
                            0
                        )

                    );

                }

            );


    sortedGames.forEach(

        (game) => {

            monthlyHistoryGames.appendChild(

                createMonthlyGameCard(
                    game,
                    monthId
                )

            );

        }

    );

}



/* ============================================================
   40. CREATE MONTHLY GAME CARD
============================================================ */

function createMonthlyGameCard(
    game,
    monthId
) {

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


    const winnerNames =
        gamePlayers
            .filter(

                (player) =>

                    winnerIds.includes(
                        player.id
                    )

            )
            .map(
                (player) =>
                    player.name
            );


    const card =
        document.createElement(
            "a"
        );


    card.className =
        "monthly-history-game-card";


    card.href =
        `game-details.html?month=${encodeURIComponent(
            monthId
        )}&game=${encodeURIComponent(
            game.id
        )}`;


    const completedDate =
        formatMonthlyGameDate(
            game.completedAt
            ||
            game.createdAt
        );


    const playerScoresHTML =
        gamePlayers
            .map(

                (player) => {

                    const isWinner =
                        winnerIds.includes(
                            player.id
                        );


                    return `

                        <div class="monthly-history-game-player">

                            <span>

                                ${isWinner ? "★ " : ""}

                                ${escapeMonthlyHistoryHTML(
                                    player.name
                                )}

                            </span>


                            <strong>

                                ${Number(
                                    totals[player.id]
                                    ||
                                    0
                                )}

                            </strong>

                        </div>

                    `;

                }

            )
            .join(
                ""
            );


    card.innerHTML = `

        <div class="monthly-history-game-top">

            <div>

                <span class="monthly-history-game-number">

                    Game #${escapeMonthlyHistoryHTML(
                        game.gameNumber
                        ||
                        "—"
                    )}

                </span>


                <span class="monthly-history-game-date">

                    ${escapeMonthlyHistoryHTML(
                        completedDate
                    )}

                </span>

            </div>


            <span class="monthly-history-game-arrow">

                ›

            </span>

        </div>


        <div class="monthly-history-game-winner">

            <span>
                Winner${winnerNames.length > 1 ? "s" : ""}
            </span>

            <strong>

                ${
                    winnerNames.length > 0

                        ? winnerNames
                            .map(
                                escapeMonthlyHistoryHTML
                            )
                            .join(
                                " • "
                            )

                        : "—"
                }

            </strong>

        </div>


        <div class="monthly-history-game-players">

            ${playerScoresHTML}

        </div>

    `;


    return card;

}



/* ============================================================
   41. FORMAT MONTHLY GAME DATE
============================================================ */

function formatMonthlyGameDate(
    timestamp
) {

    const numericTimestamp =
        Number(
            timestamp
        );


    if (
        !numericTimestamp
        ||
        !Number.isFinite(
            numericTimestamp
        )
    ) {

        return "Date unavailable";

    }


    const date =
        new Date(
            numericTimestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleDateString(

        "en-GB",

        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }

    );

}