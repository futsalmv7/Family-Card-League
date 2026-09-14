/* ============================================================
   FAMILY CARD LEAGUE
   GAME HISTORY
============================================================ */


/* ============================================================
   01. FIREBASE IMPORTS
============================================================ */

import {
    ref,
    onValue
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


import {
    database
}
from "../firebase-config.js";



/* ============================================================
   02. DOM ELEMENTS
============================================================ */

const historyMonthLabel =
    document.getElementById(
        "historyMonthLabel"
    );


const historyTotalGames =
    document.getElementById(
        "historyTotalGames"
    );


const historyCompletedGames =
    document.getElementById(
        "historyCompletedGames"
    );


const historyActiveGames =
    document.getElementById(
        "historyActiveGames"
    );


const historyResultCount =
    document.getElementById(
        "historyResultCount"
    );


const historyLoading =
    document.getElementById(
        "historyLoading"
    );


const historyEmpty =
    document.getElementById(
        "historyEmpty"
    );


const gameHistoryList =
    document.getElementById(
        "gameHistoryList"
    );


const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );



/* ============================================================
   03. PAGE STATE
============================================================ */

let activeMonth = null;

let allGames = [];

let currentFilter = "ALL";

let monthGamesUnsubscribe = null;



/* ============================================================
   04. START PAGE
============================================================ */

listenToActiveMonth();



/* ============================================================
   05. LISTEN TO ACTIVE MONTH
============================================================ */

function listenToActiveMonth() {

    const activeMonthRef =
        ref(
            database,
            "settings/activeMonth"
        );


    onValue(

        activeMonthRef,

        snapshot => {

            if (
                !snapshot.exists()
            ) {

                showNoActiveMonth();

                return;

            }


            activeMonth =
                snapshot.val();


            if (
                !activeMonth
                ||
                !activeMonth.id
            ) {

                showNoActiveMonth();

                return;

            }


            historyMonthLabel.textContent =
                activeMonth.label
                ||
                activeMonth.id;


            listenToMonthGames(
                activeMonth.id
            );

        },

        error => {

            console.error(
                "Active month error:",
                error
            );


            showHistoryError();

        }

    );

}



/* ============================================================
   06. LISTEN TO GAMES
============================================================ */

function listenToMonthGames(
    monthId
) {

    /*
       If active month ever changes,
       stop listening to the previous month.
    */

    if (
        monthGamesUnsubscribe
    ) {

        monthGamesUnsubscribe();

        monthGamesUnsubscribe =
            null;

    }


    const gamesRef =
        ref(
            database,
            `months/${monthId}/games`
        );


    monthGamesUnsubscribe =
        onValue(

            gamesRef,

            snapshot => {

                allGames = [];


                if (
                    snapshot.exists()
                ) {

                    snapshot.forEach(

                        childSnapshot => {

                            const game =
                                childSnapshot.val()
                                || {};


                            allGames.push({

                                id:
                                    childSnapshot.key,

                                ...game

                            });

                        }

                    );

                }


                /*
                   Newest game first.
                */

                allGames.sort(

                    (a, b) => {

                        const gameNumberA =
                            Number(
                                a.gameNumber
                            ) || 0;


                        const gameNumberB =
                            Number(
                                b.gameNumber
                            ) || 0;


                        return (
                            gameNumberB
                            -
                            gameNumberA
                        );

                    }

                );


                renderHistory();

            },

            error => {

                console.error(
                    "Games history error:",
                    error
                );


                showHistoryError();

            }

        );

}



/* ============================================================
   07. FILTER BUTTONS
============================================================ */

filterButtons.forEach(

    button => {

        button.addEventListener(

            "click",

            () => {

                currentFilter =
                    button.dataset.filter
                    ||
                    "ALL";


                filterButtons.forEach(

                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }

                );


                button.classList.add(
                    "active"
                );


                renderHistory();

            }

        );

    }

);



/* ============================================================
   08. RENDER HISTORY
============================================================ */

function renderHistory() {

    historyLoading.classList.add(
        "hidden"
    );


    /*
       Summary counts.
    */

    const completedGames =
        allGames.filter(

            game =>
                game.status
                ===
                "COMPLETED"

        );


    const activeGames =
        allGames.filter(

            game =>
                game.status
                ===
                "ACTIVE"

        );


    historyTotalGames.textContent =
        allGames.length;


    historyCompletedGames.textContent =
        completedGames.length;


    historyActiveGames.textContent =
        activeGames.length;



    /*
       Apply selected filter.
    */

    let visibleGames =
        [...allGames];


    if (
        currentFilter !== "ALL"
    ) {

        visibleGames =
            allGames.filter(

                game =>
                    game.status
                    ===
                    currentFilter

            );

    }



    /*
       Result count.
    */

    historyResultCount.textContent =

        visibleGames.length === 1

            ? "1 game"

            : `${visibleGames.length} games`;



    /*
       Empty state.
    */

    if (
        visibleGames.length === 0
    ) {

        gameHistoryList.innerHTML =
            "";


        gameHistoryList.classList.add(
            "hidden"
        );


        historyEmpty.classList.remove(
            "hidden"
        );


        return;

    }



    historyEmpty.classList.add(
        "hidden"
    );


    gameHistoryList.classList.remove(
        "hidden"
    );


    gameHistoryList.innerHTML =
        "";



    /*
       Create every game card.
    */

    visibleGames.forEach(

        game => {

            const card =
                createGameCard(
                    game
                );


            gameHistoryList.appendChild(
                card
            );

        }

    );

}



/* ============================================================
   09. CREATE GAME CARD
============================================================ */

function createGameCard(
    game
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "history-game-card";



    const status =
        String(
            game.status
            ||
            "UNKNOWN"
        ).toUpperCase();



    const gameNumber =
        game.gameNumber
        ??
        "?";



    const gameDate =
        formatGameDate(
            game.completedAt
            ||
            game.startedAt
            ||
            game.createdAt
        );



    const players =
        getGamePlayers(
            game
        );



    const statusClass =
        getStatusClass(
            status
        );



    /*
       Card header.
    */

    const headerHTML = `

        <div class="game-card-header">

            <div>

                <span class="game-number">
                    Game #${escapeHTML(
                        String(
                            gameNumber
                        )
                    )}
                </span>

                <span class="game-date">
                    ${escapeHTML(
                        gameDate
                    )}
                </span>

            </div>


            <span
                class="game-status ${statusClass}"
            >
                ${escapeHTML(
                    status
                )}
            </span>

        </div>

    `;



    let bodyHTML = "";



    /*
       ACTIVE GAME
    */

    if (
        status === "ACTIVE"
    ) {

        bodyHTML =
            buildActiveGameHTML(
                game,
                players
            );

    }



    /*
       COMPLETED GAME
    */

    else if (
        status === "COMPLETED"
    ) {

        bodyHTML =
            buildCompletedGameHTML(
                game,
                players
            );

    }



    /*
       CANCELLED GAME
    */

    else if (
        status === "CANCELLED"
    ) {

        bodyHTML =
            buildCancelledGameHTML(
                game,
                players
            );

    }



    /*
       Unknown / future status.
    */

    else {

        bodyHTML =
            buildBasicGameHTML(
                players
            );

    }



    card.innerHTML =
    headerHTML
    +
    bodyHTML;



/*
   Completed games open the read-only
   Game Details page when tapped.
*/

if (
    status === "COMPLETED"
) {

    card.classList.add(
        "clickable-game-card"
    );


    card.setAttribute(
        "role",
        "link"
    );


    card.setAttribute(
        "tabindex",
        "0"
    );


    const detailsLink =
        `game-details.html?month=${encodeURIComponent(
            game.monthId
            ||
            activeMonth?.id
            ||
            ""
        )}&game=${encodeURIComponent(
            game.id
        )}`;



    card.addEventListener(

        "click",

        () => {

            window.location.href =
                detailsLink;

        }

    );



    card.addEventListener(

        "keydown",

        event => {

            if (
                event.key === "Enter"
                ||
                event.key === " "
            ) {

                event.preventDefault();


                window.location.href =
                    detailsLink;

            }

        }

    );

}


return card;

}



/* ============================================================
   10. ACTIVE GAME CARD
============================================================ */

function buildActiveGameHTML(
    game,
    players
) {

    const completedMatches =
        getCompletedMatchCount(
            game
        );


    const nextMatch =
        Math.min(
            completedMatches + 1,
            10
        );


    const playerNames =
        players
            .map(
                player =>
                    player.name
            )
            .filter(Boolean)
            .join(" • ");



    const monthId =
        game.monthId
        ||
        activeMonth?.id
        ||
        "";


    const continueLink =
        `live-game.html?month=${encodeURIComponent(
            monthId
        )}&game=${encodeURIComponent(
            game.id
        )}`;



    return `

        <div class="active-game-body">

            <div class="active-progress-row">

                <div>

                    <span class="detail-label">
                        CURRENT PROGRESS
                    </span>

                    <strong class="active-progress">
                        Match ${nextMatch} of 10
                    </strong>

                </div>


                <span class="matches-completed">
                    ${completedMatches}/10 completed
                </span>

            </div>


            <div class="active-player-list">

                ${escapeHTML(
                    playerNames
                    ||
                    "Players unavailable"
                )}

            </div>


            <a
                href="${continueLink}"
                class="continue-game-button"
            >
                Continue Game
                <span>→</span>
            </a>

        </div>

    `;

}



/* ============================================================
   11. COMPLETED GAME CARD
============================================================ */

function buildCompletedGameHTML(
    game,
    players
) {

    /*
       Final totals are normally saved by live-game.js.

       If not available for an older game,
       calculate them from match scores.
    */

    const totals =
        getGameTotals(
            game,
            players
        );



    const sortedPlayers =
        [...players]
            .map(

                player => ({

                    ...player,

                    total:
                        totals[
                            player.id
                        ]
                        ?? 0

                })

            )
            .sort(

                (a, b) =>
                    b.total
                    -
                    a.total

            );



    const scoreRows =
        sortedPlayers
            .map(

                player => `

                    <div class="game-score-row">

                        <span class="score-player">
                            ${escapeHTML(
                                player.name
                                ||
                                "Unknown Player"
                            )}
                        </span>

                        <strong class="score-total">
                            ${escapeHTML(
                                String(
                                    player.total
                                )
                            )}
                        </strong>

                    </div>

                `

            )
            .join("");



    const winners =
        getGameWinners(
            game,
            sortedPlayers
        );


    const winnerText =

        winners.length === 0

            ? "Winner unavailable"

            : winners.length === 1

                ? `Winner: ${winners[0]}`

                : `Joint Winners: ${winners.join(
                    " • "
                )}`;



    return `

        <div class="completed-game-body">

            <div class="score-list">
                ${scoreRows}
            </div>


            <div class="winner-box">

                <span class="winner-symbol">
                    ★
                </span>

                <strong>
                    ${escapeHTML(
                        winnerText
                    )}
                </strong>

            </div>

        </div>

    `;

}



/* ============================================================
   12. CANCELLED GAME CARD
============================================================ */

function buildCancelledGameHTML(
    game,
    players
) {

    const completedMatches =
        getCompletedMatchCount(
            game
        );


    const playerNames =
        players
            .map(
                player =>
                    player.name
            )
            .filter(Boolean)
            .join(" • ");


    return `

        <div class="cancelled-game-body">

            <span class="detail-label">
                PLAYERS
            </span>


            <div class="cancelled-player-list">

                ${escapeHTML(
                    playerNames
                    ||
                    "Players unavailable"
                )}

            </div>


            <p class="cancelled-progress">

                ${completedMatches}
                of 10 matches were completed before
                this game was cancelled.

            </p>

        </div>

    `;

}



/* ============================================================
   13. BASIC FALLBACK CARD
============================================================ */

function buildBasicGameHTML(
    players
) {

    const playerNames =
        players
            .map(
                player =>
                    player.name
            )
            .filter(Boolean)
            .join(" • ");


    return `

        <div class="basic-game-body">

            ${escapeHTML(
                playerNames
                ||
                "Players unavailable"
            )}

        </div>

    `;

}



/* ============================================================
   14. GET GAME PLAYERS
============================================================ */

function getGamePlayers(
    game
) {

    const rawPlayers =
        Object.entries(
            game.players
            ||
            {}
        );


    const players =
        rawPlayers.map(

            ([key, value]) => ({

                id:
                    value?.id
                    ||
                    value?.playerId
                    ||
                    key,

                name:
                    value?.name
                    ||
                    "Unknown Player",

                seat:
                    Number(
                        value?.seat
                    ) || 0

            })

        );


    players.sort(

        (a, b) =>
            a.seat
            -
            b.seat

    );


    return players;

}



/* ============================================================
   15. COMPLETED MATCH COUNT
============================================================ */

function getCompletedMatchCount(
    game
) {

    const savedMatches =
        Object.keys(
            game.matches
            ||
            {}
        ).length;


    const savedCounter =
        Number(
            game.completedMatches
        ) || 0;


    return Math.max(
        savedMatches,
        savedCounter
    );

}



/* ============================================================
   16. GET FINAL TOTALS
============================================================ */

function getGameTotals(
    game,
    players
) {

    const totals = {};


    players.forEach(

        player => {

            totals[player.id] =
                0;

        }

    );



    /*
       Prefer saved finalTotals.
    */

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
                        score
                    ) || 0;

            }

        );


        return totals;

    }



    /*
       Fallback:
       calculate totals from individual matches.
    */

    const matches =
        Object.values(
            game.matches
            ||
            {}
        );


    matches.forEach(

        match => {

            const scores =
                match?.scores
                ||
                {};


            Object.entries(
                scores
            ).forEach(

                ([playerId, score]) => {

                    if (
                        totals[playerId]
                        ===
                        undefined
                    ) {

                        totals[playerId] =
                            0;

                    }


                    totals[playerId] +=
                        Number(
                            score
                        ) || 0;

                }

            );

        }

    );


    return totals;

}



/* ============================================================
   17. GET WINNERS
============================================================ */

function getGameWinners(
    game,
    sortedPlayers
) {

    /*
       First use saved winners.
    */

    if (
        game.winners
    ) {

        const rawWinners =
            Array.isArray(
                game.winners
            )

                ? game.winners

                : Object.values(
                    game.winners
                );



        const names =
            rawWinners
                .map(

                    winner => {

                        /*
                           Winner may already be a name.
                        */

                        if (
                            typeof winner
                            ===
                            "string"
                        ) {

                            const player =
                                sortedPlayers.find(

                                    item =>
                                        item.id
                                        ===
                                        winner

                                );


                            return (
                                player?.name
                                ||
                                winner
                            );

                        }



                        /*
                           Or winner may be an object.
                        */

                        return (
                            winner?.name
                            ||
                            ""
                        );

                    }

                )
                .filter(Boolean);


        if (
            names.length > 0
        ) {

            return names;

        }

    }



    /*
       Fallback:
       calculate winner from final totals.
    */

    if (
        sortedPlayers.length === 0
    ) {

        return [];

    }


    const highestScore =
        sortedPlayers[0].total;


    return sortedPlayers

        .filter(

            player =>
                player.total
                ===
                highestScore

        )

        .map(
            player =>
                player.name
        );

}



/* ============================================================
   18. STATUS CLASS
============================================================ */

function getStatusClass(
    status
) {

    if (
        status === "ACTIVE"
    ) {

        return "status-active";

    }


    if (
        status === "COMPLETED"
    ) {

        return "status-completed";

    }


    if (
        status === "CANCELLED"
    ) {

        return "status-cancelled";

    }


    return "status-unknown";

}



/* ============================================================
   19. FORMAT DATE
============================================================ */

function formatGameDate(
    timestamp
) {

    const numericTimestamp =
        Number(
            timestamp
        );


    if (
        !numericTimestamp
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



/* ============================================================
   20. NO ACTIVE MONTH
============================================================ */

function showNoActiveMonth() {

    activeMonth =
        null;


    allGames =
        [];


    historyMonthLabel.textContent =
        "No Active Month";


    historyTotalGames.textContent =
        "0";


    historyCompletedGames.textContent =
        "0";


    historyActiveGames.textContent =
        "0";


    historyResultCount.textContent =
        "0 games";


    historyLoading.classList.add(
        "hidden"
    );


    gameHistoryList.classList.add(
        "hidden"
    );


    historyEmpty.classList.remove(
        "hidden"
    );

}



/* ============================================================
   21. ERROR STATE
============================================================ */

function showHistoryError() {

    historyLoading.classList.add(
        "hidden"
    );


    gameHistoryList.classList.add(
        "hidden"
    );


    historyEmpty.classList.remove(
        "hidden"
    );


    historyEmpty.innerHTML = `

        <div class="message-icon">
            !
        </div>

        <strong>
            Could not load games
        </strong>

        <p>
            Please refresh the page and try again.
        </p>

    `;

}



/* ============================================================
   22. SAFE HTML
============================================================ */

function escapeHTML(
    value
) {

    return String(
        value
        ??
        ""
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