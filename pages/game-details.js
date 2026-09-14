/* ============================================================
   FAMILY CARD LEAGUE
   GAME DETAILS
============================================================ */


/* ============================================================
   01. FIREBASE
============================================================ */

import {
    ref,
    get
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


import {
    database
}
from "../firebase-config.js";



/* ============================================================
   02. URL PARAMETERS
============================================================ */

const params =
    new URLSearchParams(
        window.location.search
    );


const monthId =
    params.get(
        "month"
    );


const gameId =
    params.get(
        "game"
    );



/* ============================================================
   03. DOM ELEMENTS
============================================================ */

const loadingState =
    document.getElementById(
        "loadingState"
    );


const errorState =
    document.getElementById(
        "errorState"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const gameDetailsContent =
    document.getElementById(
        "gameDetailsContent"
    );


const gameTitle =
    document.getElementById(
        "gameTitle"
    );


const gameSubtitle =
    document.getElementById(
        "gameSubtitle"
    );


const summaryGameNumber =
    document.getElementById(
        "summaryGameNumber"
    );


const gameStatusBadge =
    document.getElementById(
        "gameStatusBadge"
    );


const summaryDate =
    document.getElementById(
        "summaryDate"
    );


const summaryMatches =
    document.getElementById(
        "summaryMatches"
    );


const summaryWinningScore =
    document.getElementById(
        "summaryWinningScore"
    );


const winnerText =
    document.getElementById(
        "winnerText"
    );


const winnerBanner =
    document.getElementById(
        "winnerBanner"
    );


const finalStandings =
    document.getElementById(
        "finalStandings"
    );


const matchTableHead =
    document.getElementById(
        "matchTableHead"
    );


const matchTableBody =
    document.getElementById(
        "matchTableBody"
    );


const playerTotalList =
    document.getElementById(
        "playerTotalList"
    );



/* ============================================================
   04. START
============================================================ */

if (
    !monthId
    ||
    !gameId
) {

    showError(
        "Game information is missing from the URL."
    );

}
else {

    loadGame();

}



/* ============================================================
   05. LOAD GAME
============================================================ */

async function loadGame() {

    try {

        const gameRef =
            ref(
                database,
                `months/${monthId}/games/${gameId}`
            );


        const snapshot =
            await get(
                gameRef
            );


        if (
            !snapshot.exists()
        ) {

            showError(
                "This game does not exist."
            );

            return;

        }


        const game = {

            id:
                snapshot.key,

            ...snapshot.val()

        };


        renderGame(
            game
        );

    }
    catch (error) {

        console.error(
            "Game details error:",
            error
        );


        showError(
            "Firebase could not load this game."
        );

    }

}



/* ============================================================
   06. RENDER GAME
============================================================ */

function renderGame(
    game
) {

    const status =
        String(
            game.status
            ||
            "UNKNOWN"
        ).toUpperCase();


    const players =
        getPlayers(
            game
        );


    const matches =
        getMatches(
            game
        );


    const totals =
        calculateTotals(
            game,
            players,
            matches
        );


    const standings =
        buildStandings(
            players,
            totals
        );


    const winners =
        getWinners(
            standings
        );



    /* Header */

    gameTitle.textContent =
        `Game #${game.gameNumber ?? "?"}`;


    gameSubtitle.textContent =
        game.monthLabel
        ||
        monthId;



    /* Summary */

    summaryGameNumber.textContent =
        `Game #${game.gameNumber ?? "?"}`;


    gameStatusBadge.textContent =
        status;


    gameStatusBadge.className =
        `status-badge ${getStatusClass(
            status
        )}`;


    summaryDate.textContent =
        formatDate(

            game.completedAt
            ||
            game.startedAt
            ||
            game.createdAt

        );


    summaryMatches.textContent =
        `${matches.length}/10`;


    const winningScore =
        standings.length > 0
            ? standings[0].total
            : 0;


    summaryWinningScore.textContent =
        status === "COMPLETED"
            ? winningScore
            : "—";



    /* Winner banner */

    if (
        status === "COMPLETED"
        &&
        winners.length > 0
    ) {

        winnerBanner.classList.remove(
            "hidden"
        );


        if (
            winners.length === 1
        ) {

            winnerText.textContent =
                winners[0];

        }
        else {

            winnerText.textContent =
                `Joint Winners: ${winners.join(
                    " • "
                )}`;

        }

    }
    else {

        winnerBanner.classList.add(
            "hidden"
        );

    }



    renderStandings(
        standings,
        winners
    );


    renderMatchTable(
        players,
        matches,
        totals
    );


    renderPlayerTotals(
        standings
    );



    loadingState.classList.add(
        "hidden"
    );


    errorState.classList.add(
        "hidden"
    );


    gameDetailsContent.classList.remove(
        "hidden"
    );

}



/* ============================================================
   07. GET PLAYERS
============================================================ */

function getPlayers(
    game
) {

    const players =
        Object.entries(
            game.players
            ||
            {}
        )
        .map(

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
                    "Unknown Player",

                seat:
                    Number(
                        player?.seat
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
   08. GET MATCHES
============================================================ */

function getMatches(
    game
) {

    return Object.entries(
        game.matches
        ||
        {}
    )
    .map(

        ([key, match]) => ({

            key,

            ...match,

            matchNumber:
                Number(
                    match?.matchNumber
                    ??
                    key
                ) || 0

        })

    )
    .sort(

        (a, b) =>
            a.matchNumber
            -
            b.matchNumber

    );

}



/* ============================================================
   09. CALCULATE TOTALS
============================================================ */

function calculateTotals(
    game,
    players,
    matches
) {

    const totals = {};


    players.forEach(

        player => {

            totals[player.id] =
                0;

        }

    );


    matches.forEach(

        match => {

            const scores =
                match.scores
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
   10. BUILD STANDINGS
============================================================ */

function buildStandings(
    players,
    totals
) {

    const standings =
        players.map(

            player => ({

                ...player,

                total:
                    totals[player.id]
                    ??
                    0

            })

        );


    standings.sort(

        (a, b) => {

            if (
                b.total
                !==
                a.total
            ) {

                return (
                    b.total
                    -
                    a.total
                );

            }


            return a.name.localeCompare(
                b.name
            );

        }

    );


    let previousTotal =
        null;


    let previousRank =
        0;


    standings.forEach(

        (player, index) => {

            if (
                previousTotal !== null
                &&
                player.total
                ===
                previousTotal
            ) {

                player.rank =
                    previousRank;

            }
            else {

                player.rank =
                    index + 1;


                previousRank =
                    player.rank;


                previousTotal =
                    player.total;

            }

        }

    );


    return standings;

}



/* ============================================================
   11. WINNERS
============================================================ */

function getWinners(
    standings
) {

    if (
        standings.length === 0
    ) {

        return [];

    }


    const highestScore =
        standings[0].total;


    return standings

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
   12. FINAL STANDINGS
============================================================ */

function renderStandings(
    standings,
    winners
) {

    finalStandings.innerHTML =
        "";


    standings.forEach(

        player => {

            const row =
                document.createElement(
                    "div"
                );


            const isWinner =
                winners.includes(
                    player.name
                );


            row.className =
                isWinner
                    ? "standing-row winner"
                    : "standing-row";


            row.innerHTML = `

                <span class="standing-rank">
                    #${player.rank}
                </span>

                <span class="standing-player">
                    ${escapeHTML(
                        player.name
                    )}
                </span>

                <strong class="standing-total">
                    ${player.total}
                </strong>

            `;


            finalStandings.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   13. MATCH TABLE
============================================================ */

function renderMatchTable(
    players,
    matches,
    totals
) {

    matchTableHead.innerHTML = `

        <tr>

            <th>
                Match
            </th>

            ${players
                .map(

                    player => `

                        <th>
                            ${escapeHTML(
                                player.name
                            )}
                        </th>

                    `

                )
                .join("")
            }

        </tr>

    `;



    let rowsHTML =
        "";


    for (
        let matchNumber = 1;
        matchNumber <= 10;
        matchNumber++
    ) {

        const match =
            matches.find(

                item =>
                    item.matchNumber
                    ===
                    matchNumber

            );


        rowsHTML += `

            <tr>

                <td>
                    Match ${matchNumber}
                </td>

                ${players
                    .map(

                        player => {

                            const score =
                                match?.scores?.[
                                    player.id
                                ];


                            return `

                                <td>
                                    ${
                                        score !== undefined
                                        &&
                                        score !== null

                                            ? escapeHTML(
                                                String(
                                                    score
                                                )
                                            )

                                            : "—"
                                    }
                                </td>

                            `;

                        }

                    )
                    .join("")
                }

            </tr>

        `;

    }



    rowsHTML += `

        <tr class="match-total-row">

            <td>
                TOTAL
            </td>

            ${players
                .map(

                    player => `

                        <td>
                            ${totals[player.id] ?? 0}
                        </td>

                    `

                )
                .join("")
            }

        </tr>

    `;


    matchTableBody.innerHTML =
        rowsHTML;

}



/* ============================================================
   14. PLAYER TOTALS
============================================================ */

function renderPlayerTotals(
    standings
) {

    playerTotalList.innerHTML =
        "";


    standings.forEach(

        player => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "player-total-card";


            card.innerHTML = `

                <span>
                    ${escapeHTML(
                        player.name
                    )}
                </span>

                <strong>
                    ${player.total}
                </strong>

            `;


            playerTotalList.appendChild(
                card
            );

        }

    );

}



/* ============================================================
   15. STATUS CLASS
============================================================ */

function getStatusClass(
    status
) {

    if (
        status === "COMPLETED"
    ) {

        return "status-completed";

    }


    if (
        status === "ACTIVE"
    ) {

        return "status-active";

    }


    if (
        status === "CANCELLED"
    ) {

        return "status-cancelled";

    }


    return "";

}



/* ============================================================
   16. FORMAT DATE
============================================================ */

function formatDate(
    timestamp
) {

    const value =
        Number(
            timestamp
        );


    if (
        !value
    ) {

        return "Unavailable";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unavailable";

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
   17. ERROR STATE
============================================================ */

function showError(
    message
) {

    loadingState.classList.add(
        "hidden"
    );


    gameDetailsContent.classList.add(
        "hidden"
    );


    errorState.classList.remove(
        "hidden"
    );


    errorMessage.textContent =
        message;

}



/* ============================================================
   18. SAFE HTML
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