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
   MATCH COMMENTS - DOM ELEMENTS
============================================================ */

const matchCommentsSection =
    document.getElementById("matchCommentsSection");

const matchCommentsList =
    document.getElementById("matchCommentsList");

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

    // Display one shared Game Comments section in History.
renderGameComments(game);

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

/* ============================================================
   MATCH COMMENTS - READ ONLY HISTORY
============================================================ */

function renderSavedMatchComments(game, matches) {

    matchCommentsList.innerHTML = "";

    const allComments = game.matchComments || {};

    if (matches.length === 0) {
        matchCommentsSection.classList.add("hidden");
        return;
    }

    matchCommentsSection.classList.remove("hidden");

    matches.forEach((match) => {

        const comments = Object.values(
            allComments[match.matchNumber] || {}
        ).sort((a, b) =>
            (a.createdAt || 0) - (b.createdAt || 0)
        );

        const card = document.createElement("div");
        card.className = "history-comment-card";

        const heading = document.createElement("h3");
        heading.textContent =
            `Match ${match.matchNumber} · ${comments.length} comment${comments.length === 1 ? "" : "s"}`;

        card.appendChild(heading);

        if (comments.length === 0) {

            const empty = document.createElement("p");
            empty.textContent = "No comments for this match.";
            card.appendChild(empty);

        } else {

            comments.forEach((comment) => {

                const message = document.createElement("div");
                message.className = "history-comment-message";

                const author = document.createElement("strong");
                author.textContent = comment.playerName || "Player";

                const time = document.createElement("small");

                const timestamp = Number(comment.createdAt);

                time.textContent =
                    Number.isFinite(timestamp) && timestamp > 0
                        ? new Date(timestamp).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                        : "";

                const text = document.createElement("p");
                text.textContent = comment.text || "";

                message.appendChild(author);
                message.appendChild(time);
                message.appendChild(text);

                card.appendChild(message);

            });

        }

        matchCommentsList.appendChild(card);

    });

}

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


/* ============================================================
   GAME COMMENTS - HISTORY (READ ONLY)
============================================================ */

function renderGameComments(game) {

    const commentsList =
        document.getElementById("matchCommentsList");

    const commentsSection =
        document.getElementById("matchCommentsSection");

    if (!commentsList || !commentsSection) {
        return;
    }

    // Collect new game-level comments.
    const comments = Object.values(game.gameComments || {});

    // Include older comments saved under individual matches.
    Object.values(game.matchComments || {}).forEach(matchComments => {

        if (!matchComments || typeof matchComments !== "object") {
            return;
        }

        Object.values(matchComments).forEach(comment => {
            comments.push(comment);
        });

    });

    // Show comment count beside the heading.
    const countElement = document.getElementById("gameCommentsCount");
    if (countElement) countElement.textContent = `(${comments.length})`;

    // Display oldest comments first.
    comments.sort((a, b) =>
        (Number(a.createdAt) || 0) -
        (Number(b.createdAt) || 0)
    );

    if (comments.length === 0) {

        commentsList.innerHTML = `
            <p class="match-comment-empty">
                No comments were posted for this game.
            </p>
        `;

        return;
    }

    commentsList.innerHTML = `
        <div class="game-history-comments">

            <p>
                💬 ${comments.length}
                ${comments.length === 1 ? "comment" : "comments"}
            </p>

            ${comments.map(comment => {

                const playerName =
                    escapeHTML(comment.playerName || "Player");

                const message =
                    escapeHTML(comment.text || "");

                const timestamp = Number(comment.createdAt);

                const time =
                    Number.isFinite(timestamp) && timestamp > 0
                        ? new Date(timestamp).toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short"
                        })
                        : "";

                return `
                    <div class="match-comment-message">

                        <div class="match-comment-message-header">
                            <strong>${playerName}</strong>
                            <span>${time}</span>
                        </div>

                        <div class="match-comment-message-text">
                            ${message}
                        </div>

                    </div>
                `;

            }).join("")}

        </div>
    `;

}


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