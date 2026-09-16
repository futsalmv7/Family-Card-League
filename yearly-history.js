/* ============================================================
   FAMILY CARD LEAGUE
   YEARLY HISTORY PAGE

   Responsibilities:
   01. Firebase imports
   02. Page state
   03. Load all months
   04. Detect available years
   05. Sort years

   More yearly-history logic will be added
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

const yearlyHistoryLoadingState =
    document.getElementById(
        "yearlyHistoryLoadingState"
    );


const yearlyHistoryEmptyState =
    document.getElementById(
        "yearlyHistoryEmptyState"
    );


const yearlyHistoryYears =
    document.getElementById(
        "yearlyHistoryYears"
    );

const yearlyHistorySelectedYearContent =
    document.getElementById(
        "yearlyHistorySelectedYearContent"
    );


const yearlyHistorySelectedYearTitle =
    document.getElementById(
        "yearlyHistorySelectedYearTitle"
    );


const yearlyHistorySelectedYearStatus =
    document.getElementById(
        "yearlyHistorySelectedYearStatus"
    );


const yearlyHistoryGameCount =
    document.getElementById(
        "yearlyHistoryGameCount"
    );


const yearlyHistoryPlayerCount =
    document.getElementById(
        "yearlyHistoryPlayerCount"
    );


const yearlyHistoryStandings =
    document.getElementById(
        "yearlyHistoryStandings"
    );

    const yearlyHistoryCategoryCutoff =
    document.getElementById(
        "yearlyHistoryCategoryCutoff"
    );


const yearlyHistoryCategoryOne =
    document.getElementById(
        "yearlyHistoryCategoryOne"
    );


const yearlyHistoryCategoryTwo =
    document.getElementById(
        "yearlyHistoryCategoryTwo"
    );

/* ============================================================
   02. PAGE STATE
============================================================ */

let allMonths =
    {};


let availableYears =
    [];



/* ============================================================
   03. START PAGE
============================================================ */

loadYearlyHistory();



/* ============================================================
   04. LOAD YEARLY HISTORY

   Reads the complete months collection.

   No Firebase data is changed.
============================================================ */

async function loadYearlyHistory() {

    try {

        const monthsSnapshot =
            await get(

                ref(
                    database,
                    "months"
                )

            );


        allMonths =
            monthsSnapshot.exists()

                ? monthsSnapshot.val()

                : {};


        availableYears =
    getAvailableYears(
        allMonths
    );


renderAvailableYears();


renderSelectedYear();


console.log(
            "Yearly history months loaded:",
            Object.keys(
                allMonths
            ).length
        );


        console.log(
            "Available league years:",
            availableYears
        );

    }

    catch (error) {

    console.error(
        "Unable to load yearly history:",
        error
    );


    yearlyHistoryLoadingState.classList.add(
        "hidden"
    );


    yearlyHistoryYears.classList.add(
        "hidden"
    );


    yearlyHistoryEmptyState.classList.remove(
        "hidden"
    );


    yearlyHistoryEmptyState.querySelector(
        "strong"
    ).textContent =
        "Unable to load yearly history";


    yearlyHistoryEmptyState.querySelector(
        "p"
    ).textContent =
        "Check the Firebase connection and try again.";

}

}



/* ============================================================
   05. GET AVAILABLE YEARS

   Month IDs use:

   YYYY-MM

   Examples:

   2026-09
   2026-10
   2027-01

   These become:

   2026
   2027

   Duplicate years are removed.
============================================================ */

function getAvailableYears(
    months
) {

    const years =
        new Set();


    Object.keys(
        months || {}
    )
    .forEach(

        (monthId) => {

            const year =
                getYearFromMonthId(
                    monthId
                );


            if (
                year !== null
            ) {

                years.add(
                    year
                );

            }

        }

    );


    /*
       Newest year first.

       Example:

       2027
       2026
       2025
    */

    return Array.from(
        years
    )
    .sort(

        (yearA, yearB) =>

            yearB
            -
            yearA

    );

}



/* ============================================================
   06. GET YEAR FROM MONTH ID

   Valid:

   2026-09
   2027-01

   Invalid IDs are ignored instead of causing
   the Yearly History page to fail.
============================================================ */

function getYearFromMonthId(
    monthId
) {

    const value =
        String(
            monthId || ""
        );


    const match =
        value.match(
            /^(\d{4})-(\d{2})$/
        );


    if (
        !match
    ) {

        return null;

    }


    const year =
        Number(
            match[1]
        );


    const monthNumber =
        Number(
            match[2]
        );


    if (
        !Number.isInteger(
            year
        )
        ||
        !Number.isInteger(
            monthNumber
        )
        ||
        monthNumber < 1
        ||
        monthNumber > 12
    ) {

        return null;

    }


    return year;

}

/* ============================================================
   RENDER AVAILABLE YEARS
============================================================ */

function renderAvailableYears() {

    yearlyHistoryLoadingState.classList.add(
        "hidden"
    );


    yearlyHistoryYears.innerHTML =
        "";


    /*
       No league years exist yet.
    */

    if (
        availableYears.length === 0
    ) {

        yearlyHistoryYears.classList.add(
            "hidden"
        );


        yearlyHistoryEmptyState.classList.remove(
            "hidden"
        );


        return;

    }


    /*
       At least one year exists.
    */

    yearlyHistoryEmptyState.classList.add(
        "hidden"
    );


    yearlyHistoryYears.classList.remove(
        "hidden"
    );


    const currentYear =
        getCurrentLeagueYear();


    availableYears.forEach(

        (year) => {

            const yearCard =
                createYearCard(
                    year,
                    currentYear
                );


            yearlyHistoryYears.appendChild(
                yearCard
            );

        }

    );

}



/* ============================================================
   CURRENT LEAGUE YEAR

   The newest available year is treated as the current
   league year for this history list.

   Later, year finalization will give us an explicit
   finalized/current status.
============================================================ */

function getCurrentLeagueYear() {

    if (
        availableYears.length === 0
    ) {

        return null;

    }


    return availableYears[0];

}



/* ============================================================
   CREATE YEAR CARD
============================================================ */

function createYearCard(
    year,
    currentYear
) {

    const card =
        document.createElement(
            "a"
        );


    card.className =
        "yearly-history-year-card";


    /*
       In the next step this URL will open the
       selected year's full summary.
    */

    card.href =
        `yearly-history.html?year=${encodeURIComponent(
            year
        )}`;


    const isCurrentYear =
        year === currentYear;


    card.innerHTML = `

        <div class="yearly-history-year-main">

            <span class="yearly-history-year-label">
                LEAGUE YEAR
            </span>

            <strong class="yearly-history-year-number">
                ${year}
            </strong>

            <span class="yearly-history-year-status">

                ${
                    isCurrentYear
                        ? "Current Year"
                        : "Previous Year"
                }

            </span>

        </div>


        <div class="yearly-history-year-action">

            <span>
                View Summary
            </span>

            <strong>
                ›
            </strong>

        </div>

    `;


    return card;

}

/* ============================================================
   SELECTED YEAR

   Reads:

   ?year=2026
============================================================ */

function getSelectedYear() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const requestedYear =
        Number(
            params.get(
                "year"
            )
        );


    if (
        Number.isInteger(
            requestedYear
        )
        &&
        availableYears.includes(
            requestedYear
        )
    ) {

        return requestedYear;

    }


    return null;

}



/* ============================================================
   RENDER SELECTED YEAR
============================================================ */

function renderSelectedYear() {

    const selectedYear =
        getSelectedYear();


    /*
       No year was selected.

       Keep the normal list of available years visible.
    */

    if (
        selectedYear === null
    ) {

        yearlyHistorySelectedYearContent.classList.add(
            "hidden"
        );


        return;

    }


    yearlyHistorySelectedYearContent.classList.remove(
        "hidden"
    );


    const completedGames =
        getCompletedGamesForYear(
            selectedYear
        );


    const playerStats =
        calculateYearlyPlayerStats(
            completedGames
        );


    const ranking =
        buildYearlyRanking(

            Object.values(
                playerStats
            )

        );


    yearlyHistorySelectedYearTitle.textContent =
        `${selectedYear} Summary`;


    /*
       For now this is only a descriptive history-page status.

       We are NOT claiming the year is finalized.

       Actual finalized/current status will come when
       year finalization is implemented.
    */

    const newestYear =
        availableYears[0];


    yearlyHistorySelectedYearStatus.textContent =

        selectedYear === newestYear

            ? "Current Year"

            : "Previous Year";


    yearlyHistoryGameCount.textContent =
        completedGames.length;


    yearlyHistoryPlayerCount.textContent =
        Object.keys(
            playerStats
        ).length;


    renderYearlyStandings(
    ranking
);


calculateAndRenderSelectedYearCategories(
    playerStats
);


console.log(
        `Yearly summary loaded for ${selectedYear}:`,
        {
            completedGames:
                completedGames.length,

            players:
                Object.keys(
                    playerStats
                ).length
        }
    );

}



/* ============================================================
   GET COMPLETED GAMES FOR SELECTED YEAR

   Only COMPLETED games count.

   ACTIVE and CANCELLED games are ignored.

   This follows the same rule as the working Dashboard
   Current Year Ranking.
============================================================ */

function getCompletedGamesForYear(
    selectedYear
) {

    const completedGames =
        [];


    Object.entries(
        allMonths || {}
    )
    .forEach(

        ([monthId, month]) => {

            if (!month) {
                return;
            }


            const monthYear =
                getYearFromMonthId(
                    monthId
                );


            if (
                monthYear !==
                selectedYear
            ) {

                return;

            }


            Object.entries(
                month.games || {}
            )
            .forEach(

                ([gameId, game]) => {

                    if (
                        !game
                        ||
                        String(
                            game.status || ""
                        ).toUpperCase()
                        !==
                        "COMPLETED"
                    ) {

                        return;

                    }


                    completedGames.push({

                        id:
                            gameId,

                        monthId:
                            monthId,

                        ...game

                    });

                }

            );

        }

    );


    return completedGames;

}



/* ============================================================
   CALCULATE YEARLY PLAYER STATS

   Same statistical rules as the working Dashboard:

   - Games Played
   - Games Won
   - Total Points
   - Average Points
   - Win %

   Average Points =
   Total Points / Completed Games Played
============================================================ */

function calculateYearlyPlayerStats(
    completedGames
) {

    const stats =
        {};


    completedGames.forEach(

        (game) => {

            if (
                !game.players
            ) {

                return;

            }


            /*
               Participation and points.
            */

            Object.entries(
                game.players
            )
            .forEach(

                ([playerId, gamePlayer]) => {

                    if (
                        !stats[
                            playerId
                        ]
                    ) {

                        stats[
                            playerId
                        ] = {

                            playerId:
                                playerId,

                            name:
                                gamePlayer?.name
                                ||
                                "Unknown Player",

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

                        };

                    }


                    stats[
                        playerId
                    ].gamesPlayed +=
                        1;


                    stats[
                        playerId
                    ].totalPoints +=
                        getYearlyPlayerGamePoints(
                            game,
                            playerId
                        );

                }

            );


            /*
               Winners are already stored by each completed game.

               We are NOT recalculating or changing the
               individual game winner.
            */

            if (
                game.winners
            ) {

                Object.keys(
                    game.winners
                )
                .forEach(

                    (winnerId) => {

                        if (
                            stats[
                                winnerId
                            ]
                        ) {

                            stats[
                                winnerId
                            ].gamesWon +=
                                1;

                        }

                    }

                );

            }

        }

    );


    /*
       Calculate yearly Average Points and Win %.
    */

    Object.values(
        stats
    )
    .forEach(

        (player) => {

            if (
                player.gamesPlayed <= 0
            ) {

                return;

            }


            player.averagePoints =
                player.totalPoints
                /
                player.gamesPlayed;


            player.winPercentage =
                (
                    player.gamesWon
                    /
                    player.gamesPlayed
                )
                *
                100;

        }

    );


    return stats;

}



/* ============================================================
   PLAYER TOTAL FROM ONE COMPLETED GAME

   This intentionally matches the working Dashboard logic.

   Individual integer match scores are added together.
============================================================ */

function getYearlyPlayerGamePoints(
    game,
    playerId
) {

    let total =
        0;


    if (
        !game.matches
    ) {

        return total;

    }


    Object.values(
        game.matches
    )
    .forEach(

        (match) => {

            const score =
                Number(
                    match.scores?.[
                        playerId
                    ]
                );


            if (
                Number.isFinite(
                    score
                )
                &&
                Number.isInteger(
                    score
                )
            ) {

                total +=
                    score;

            }

        }

    );


    return total;

}



/* ============================================================
   BUILD YEARLY RANKING

   Official player-standing order:

   1. Average Points
   2. Win %
   3. Games Won
   4. Exact tie = joint rank

   Alphabetical order is only used for stable display.
============================================================ */

function buildYearlyRanking(
    players
) {

    const ranking =
        [...players];


    ranking.sort(

        (playerA, playerB) => {

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
               Stable display only.

               This does NOT break an official tie.
            */

            return String(
                playerA.name || ""
            ).localeCompare(
                String(
                    playerB.name || ""
                )
            );

        }

    );


    let previousPlayer =
        null;


    ranking.forEach(

        (player, index) => {

            if (
                previousPlayer
                &&
                hasSameYearlyRankingResult(
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


    return ranking;

}



/* ============================================================
   SAME YEARLY RANKING RESULT

   Competition ranking examples:

   1, 1, 3

   1, 1, 1, 4
============================================================ */

function hasSameYearlyRankingResult(
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
   RENDER YEARLY STANDINGS
============================================================ */

function renderYearlyStandings(
    ranking
) {

    yearlyHistoryStandings.innerHTML =
        "";


    if (
        ranking.length === 0
    ) {

        yearlyHistoryStandings.innerHTML = `

            <div class="yearly-history-empty-standings">

                No completed games for this year.

            </div>

        `;


        return;

    }


    ranking.forEach(

        (player) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "yearly-history-standing-row";


            row.innerHTML = `

                <div class="yearly-history-standing-top">

                    <div class="yearly-history-standing-player">

                        ${escapeYearlyHistoryHTML(
                            player.name
                        )}

                    </div>


                    <div class="yearly-history-standing-rank">

                        #${player.rank}

                    </div>

                </div>


                <div class="yearly-history-standing-stats">


                    <div class="yearly-history-standing-stat">

                        <strong>
                            ${player.gamesPlayed}
                        </strong>

                        <span>
                            Played
                        </span>

                    </div>


                    <div class="yearly-history-standing-stat">

                        <strong>
                            ${player.gamesWon}
                        </strong>

                        <span>
                            Won
                        </span>

                    </div>


                    <div class="yearly-history-standing-stat">

                        <strong>
                            ${formatYearlyPercentage(
                                player.winPercentage
                            )}
                        </strong>

                        <span>
                            Win %
                        </span>

                    </div>


                    <div class="yearly-history-standing-stat">

                        <strong>
                            ${formatYearlyAveragePoints(
                                player.averagePoints
                            )}
                        </strong>

                        <span>
                            Avg
                        </span>

                    </div>


                    <div class="yearly-history-standing-stat">

                        <strong>
                            ${formatYearlyPoints(
                                player.totalPoints
                            )}
                        </strong>

                        <span>
                            Points
                        </span>

                    </div>


                </div>

            `;


            yearlyHistoryStandings.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   FORMAT YEARLY WIN %
============================================================ */

function formatYearlyPercentage(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "0%";

    }


    if (
        Number.isInteger(
            number
        )
    ) {

        return `${number}%`;

    }


    return `${number.toFixed(1)}%`;

}



/* ============================================================
   FORMAT YEARLY AVERAGE POINTS
============================================================ */

function formatYearlyAveragePoints(
    value
) {

    const number =
        Number(
            value
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

        return new Intl.NumberFormat(
            "en-US"
        ).format(
            number
        );

    }


    return new Intl.NumberFormat(

        "en-US",

        {
            minimumFractionDigits:
                1,

            maximumFractionDigits:
                1
        }

    ).format(
        number
    );

}



/* ============================================================
   FORMAT YEARLY POINTS
============================================================ */

function formatYearlyPoints(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "0";

    }


    return new Intl.NumberFormat(
        "en-US"
    ).format(
        Math.round(
            number
        )
    );

}



/* ============================================================
   SAFE YEARLY HISTORY HTML
============================================================ */

function escapeYearlyHistoryHTML(
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
   SELECTED YEAR CATEGORIES

   Membership uses yearly COMPLETED games only.

   Cutoff =
   ceil(
       highest yearly Games Played
       /
       2
   )

   Category 1:
   Games Played >= cutoff

   Category 2:
   Games Played > 0
   AND
   Games Played < cutoff

   Each category gets its own independent ranking.
============================================================ */

function calculateAndRenderSelectedYearCategories(
    playerStats
) {

    const players =
        Object.values(
            playerStats
        );


    /*
       No completed games / participants.
    */

    if (
        players.length === 0
    ) {

        resetSelectedYearCategories();

        return;

    }


    /*
       Highest yearly participation.
    */

    const maximumGamesPlayed =
        Math.max(

            ...players.map(

                (player) =>
                    player.gamesPlayed

            )

        );


    /*
       Same cutoff rule used by the Dashboard
       Current Year Categories.
    */

    const cutoff =
        Math.ceil(
            maximumGamesPlayed
            /
            2
        );


    yearlyHistoryCategoryCutoff.textContent =
        `Cutoff ${cutoff}`;


    /* --------------------------------------------------------
       CATEGORY 1

       Regular Players
    --------------------------------------------------------- */

    const categoryOnePlayers =
        players.filter(

            (player) =>

                player.gamesPlayed
                >=
                cutoff

        );


    const categoryOneRanking =
        buildYearlyRanking(
            categoryOnePlayers
        );


    renderSelectedYearCategory(
        categoryOneRanking,
        yearlyHistoryCategoryOne
    );


    /* --------------------------------------------------------
       CATEGORY 2

       Casual Players

       Zero-game players are excluded.
    --------------------------------------------------------- */

    const categoryTwoPlayers =
        players.filter(

            (player) =>

                player.gamesPlayed > 0

                &&

                player.gamesPlayed
                <
                cutoff

        );


    const categoryTwoRanking =
        buildYearlyRanking(
            categoryTwoPlayers
        );


    renderSelectedYearCategory(
        categoryTwoRanking,
        yearlyHistoryCategoryTwo
    );

}



/* ============================================================
   RENDER SELECTED YEAR CATEGORY

   Important:

   The overall yearly rank is NOT reused.

   buildYearlyRanking() has already assigned a new,
   independent rank inside this category.
============================================================ */

function renderSelectedYearCategory(
    ranking,
    element
) {

    if (!element) {
        return;
    }


    element.innerHTML =
        "";


    if (
        ranking.length === 0
    ) {

        element.innerHTML = `

            <div class="yearly-history-category-empty">

                No qualified players yet

            </div>

        `;


        return;

    }


    ranking.forEach(

        (player) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "yearly-history-category-row";


            row.innerHTML = `

                <div class="yearly-history-category-player">

                    ${escapeYearlyHistoryHTML(
                        player.name
                    )}

                </div>


                <div class="yearly-history-category-result">

                    <span class="yearly-history-category-average">

                        Avg ${formatYearlyAveragePoints(
                            player.averagePoints
                        )}

                    </span>


                    <strong class="yearly-history-category-rank">

                        #${player.rank}

                    </strong>

                </div>

            `;


            element.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   RESET SELECTED YEAR CATEGORIES
============================================================ */

function resetSelectedYearCategories() {

    if (
        yearlyHistoryCategoryCutoff
    ) {

        yearlyHistoryCategoryCutoff.textContent =
            "Cutoff —";

    }


    if (
        yearlyHistoryCategoryOne
    ) {

        yearlyHistoryCategoryOne.innerHTML = `

            <div class="yearly-history-category-empty">

                No qualified players yet

            </div>

        `;

    }


    if (
        yearlyHistoryCategoryTwo
    ) {

        yearlyHistoryCategoryTwo.innerHTML = `

            <div class="yearly-history-category-empty">

                No qualified players yet

            </div>

        `;

    }

}