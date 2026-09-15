/* ============================================================
   FAMILY CARD LEAGUE
   LIVE GAME / SCORE ENTRY

   Responsibilities:
   01. Read game from URL
   02. Listen to game live
   03. Render players
   04. Enter individual match scores
   05. Save every match separately
   06. Calculate running game totals
   07. Show match history
   08. Complete game after Match 10
   09. Determine winner(s)
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
    onValue,
    get,
    update,
    runTransaction
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* ============================================================
   02. PAGE STATE
============================================================ */

let monthId = null;

let gameId = null;

let currentGame = null;

let orderedPlayers = [];

let matchBeingSaved = false;


/* ============================================================
   03. DOM REFERENCES
============================================================ */

const loadingState =
    document.getElementById("loadingState");


const errorState =
    document.getElementById("errorState");


const errorMessage =
    document.getElementById("errorMessage");


const activeGameContent =
    document.getElementById("activeGameContent");


const completedGameCard =
    document.getElementById("completedGameCard");


const gameTitle =
    document.getElementById("gameTitle");


const gameMonth =
    document.getElementById("gameMonth");


const gameStatusBadge =
    document.getElementById("gameStatusBadge");


const currentMatchLabel =
    document.getElementById("currentMatchLabel");


const completedMatchesNumber =
    document.getElementById("completedMatchesNumber");


const progressFill =
    document.getElementById("progressFill");


const scoreEntryTitle =
    document.getElementById("scoreEntryTitle");


const scoreEntryCard =
    document.getElementById("scoreEntryCard");


const scoreForm =
    document.getElementById("scoreForm");


const scoreEntryList =
    document.getElementById("scoreEntryList");


const saveMatchButton =
    document.getElementById("saveMatchButton");


const scoreMessage =
    document.getElementById("scoreMessage");


const totalsList =
    document.getElementById("totalsList");


const noMatchHistory =
    document.getElementById("noMatchHistory");


const matchHistoryWrapper =
    document.getElementById("matchHistoryWrapper");


const matchHistoryHead =
    document.getElementById("matchHistoryHead");


const matchHistoryBody =
    document.getElementById("matchHistoryBody");


const completedGameTitle =
    document.getElementById("completedGameTitle");


const winnerNames =
    document.getElementById("winnerNames");


const winnerScore =
    document.getElementById("winnerScore");


const finalResults =
    document.getElementById("finalResults");


/* ============================================================
   04. INITIALIZE
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        readGameFromURL();

        if (
            !monthId
            ||
            !gameId
        ) {

            showFatalError(
                "No game was specified."
            );

            return;

        }


        listenToGame();

    }

);


/* ============================================================
   05. READ GAME FROM URL

   Example:
   live-game.html?month=2026-09&game=-FirebaseGameID
============================================================ */

function readGameFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    monthId =
        params.get("month");


    gameId =
        params.get("game");

}


/* ============================================================
   06. LIVE FIREBASE GAME LISTENER

   Any saved match immediately appears on every device that
   has this game open.
============================================================ */

function listenToGame() {

    const gameRef =
        ref(
            database,
            `months/${monthId}/games/${gameId}`
        );


    onValue(

        gameRef,

        (snapshot) => {

            loadingState.classList.add(
                "hidden"
            );


            if (!snapshot.exists()) {

                showFatalError(
                    "This game does not exist."
                );

                return;

            }


            currentGame =
                snapshot.val();


            preparePlayers();


            renderGame();

        },

        (error) => {

            console.error(
                "Game listener error:",
                error
            );


            showFatalError(
                "Firebase could not load this game."
            );

        }

    );

}


/* ============================================================
   07. PREPARE PLAYERS IN SEAT ORDER
============================================================ */

function preparePlayers() {

    orderedPlayers = [];


    if (!currentGame.players) {
        return;
    }


    Object.entries(
        currentGame.players
    )
    .forEach(

        ([playerId, player]) => {

            orderedPlayers.push({

                id:
                    playerId,

                name:
                    player.name,

                seat:
                    Number(player.seat)

            });

        }

    );


    orderedPlayers.sort(

        (a, b) =>
            a.seat - b.seat

    );

}


/* ============================================================
   08. RENDER WHOLE GAME
============================================================ */

function renderGame() {

    gameTitle.textContent =
        `Game #${currentGame.gameNumber}`;


    gameMonth.textContent =
        currentGame.monthLabel || monthId;


    gameStatusBadge.textContent =
        currentGame.status;


    if (
        currentGame.status === "COMPLETED"
    ) {

        activeGameContent.classList.add(
            "hidden"
        );


        completedGameCard.classList.remove(
            "hidden"
        );


        renderCompletedGame();

        return;

    }


    if (
        currentGame.status === "CANCELLED"
    ) {

        activeGameContent.classList.add(
            "hidden"
        );


        showFatalError(
            "This game has been cancelled."
        );

        return;

    }


    completedGameCard.classList.add(
        "hidden"
    );


    activeGameContent.classList.remove(
        "hidden"
    );


    const completedMatches =
        getCompletedMatchCount();


    const nextMatch =
        Math.min(
            completedMatches + 1,
            10
        );


    currentMatchLabel.textContent =
        `Match ${nextMatch} of 10`;


    completedMatchesNumber.textContent =
        completedMatches;


    progressFill.style.width =
        `${completedMatches * 10}%`;


    scoreEntryTitle.textContent =
        `Match ${nextMatch}`;


    renderScoreInputs(
        nextMatch
    );


    renderTotals();


    renderMatchHistory();

}


/* ============================================================
   09. GET SAVED MATCHES
============================================================ */

function getMatches() {

    if (!currentGame.matches) {

        return [];

    }


    return Object.entries(
        currentGame.matches
    )
    .map(

        ([matchNumber, match]) => ({

            matchNumber:
                Number(matchNumber),

            ...match

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
   10. COMPLETED MATCH COUNT
============================================================ */

function getCompletedMatchCount() {

    return getMatches().length;

}


/* ============================================================
   11. SCORE INPUTS
============================================================ */

function renderScoreInputs(
    matchNumber
) {

    scoreEntryList.innerHTML =
        "";


    orderedPlayers.forEach(

        (player) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "score-entry-row";


            row.innerHTML = `

                <div class="score-player-avatar">
                    ${escapeHTML(
                        getInitials(player.name)
                    )}
                </div>

                <div class="score-player-info">

                    <div class="score-player-name">
                        ${escapeHTML(player.name)}
                    </div>

                    <span class="score-player-seat">
                        Seat ${player.seat}
                    </span>

                </div>

                <div class="score-input-group">

    <button
        type="button"
        class="score-sign-button"
        data-score-input="score-${player.id}"
        aria-label="Toggle negative score for ${escapeHTML(player.name)}"
    >
        −
    </button>

    <input
        class="score-input"
        type="number"
        step="1"
        inputmode="numeric"
        id="score-${player.id}"
        data-player-id="${player.id}"
        placeholder="0"
        aria-label="${escapeHTML(player.name)} score"
        required
    >

</div>

            `;


            scoreEntryList.appendChild(
                row
            );

        }

    );

           /*
       Negative / positive score toggle buttons.

       Enter the score first, then tap the − button
       to change between positive and negative.
    */

    scoreEntryList
        .querySelectorAll(
            ".score-sign-button"
        )
        .forEach(

            (button) => {

                button.addEventListener(

                    "click",

                    () => {

                        const input =
                            document.getElementById(
                                button.dataset.scoreInput
                            );


                        if (!input) {
                            return;
                        }


                        const rawValue =
                            input.value.trim();


                        if (rawValue === "") {

                            input.focus();

                            return;

                        }


                        const score =
                            Number(rawValue);


                        if (
                            !Number.isFinite(score)
                        ) {

                            input.focus();

                            return;

                        }


                        if (score < 0) {

                            input.value =
                                Math.abs(score);


                            button.classList.remove(
                                "negative"
                            );

                        }

                        else if (score > 0) {

                            input.value =
                                -score;


                            button.classList.add(
                                "negative"
                            );

                        }


                        input.focus();

                    }

                );

            }

        );


    saveMatchButton.textContent =
        matchNumber === 10
            ? "Save Final Match"
            : "Save Match";

}


/* ============================================================
   12. SAVE MATCH
============================================================ */

scoreForm.addEventListener(

    "submit",

    async (event) => {

        event.preventDefault();


        if (
            matchBeingSaved
            ||
            !currentGame
            ||
            currentGame.status !== "ACTIVE"
        ) {

            return;

        }


        const completedMatches =
            getCompletedMatchCount();


        const matchNumber =
            completedMatches + 1;


        if (matchNumber > 10) {
            return;
        }


        const scores = {};


        for (
            const player
            of orderedPlayers
        ) {

            const input =
                document.getElementById(
                    `score-${player.id}`
                );


            if (!input) {

                showScoreMessage(
                    "A score input is missing.",
                    "error"
                );

                return;

            }


            const rawValue =
                input.value.trim();


            if (rawValue === "") {

                showScoreMessage(
                    `Enter a score for ${player.name}.`,
                    "error"
                );


                input.focus();

                return;

            }


            const number =
    Number(rawValue);


if (
    !Number.isFinite(number)
    ||
    !Number.isInteger(number)
) {

    showScoreMessage(
        `${player.name}'s score must be a whole number.`,
        "error"
    );


    input.focus();

    return;

}


            scores[player.id] =
                number;

        }


        try {

            matchBeingSaved =
                true;


            saveMatchButton.disabled =
                true;


            saveMatchButton.textContent =
                "Saving...";


            clearScoreMessage();


            const matchRef =
                ref(
                    database,
                    `months/${monthId}/games/${gameId}/matches/${matchNumber}`
                );


            /*
               Transaction prevents an already-saved match
               from being silently overwritten by another device.
            */

            const result =
                await runTransaction(

                    matchRef,

                    (currentValue) => {

                        if (
                            currentValue !== null
                        ) {

                            return;

                        }


                        return {

                            matchNumber:
                                matchNumber,

                            scores:
                                scores,

                            createdAt:
                                Date.now()

                        };

                    }

                );


            if (!result.committed) {

                throw new Error(
                    "This match was already saved from another device."
                );

            }


            /*
               Update convenience fields.
               The actual source of truth remains /matches.
            */

            await update(

                ref(
                    database,
                    `months/${monthId}/games/${gameId}`
                ),

                {

                    completedMatches:
                        matchNumber,

                    currentMatchNumber:
                        Math.min(
                            matchNumber + 1,
                            10
                        ),

                    updatedAt:
                        Date.now()

                }

            );


            /*
               Match 10 completes the whole game.
            */

            if (matchNumber === 10) {

                await completeGame();

            }

            else {

                showScoreMessage(
                    `Match ${matchNumber} saved.`,
                    "success"
                );

            }

        }

        catch (error) {

            console.error(
                "Save match error:",
                error
            );


            showScoreMessage(
                error.message
                ||
                "The match could not be saved.",
                "error"
            );

        }

        finally {

            matchBeingSaved =
                false;


            saveMatchButton.disabled =
                false;

        }

    }

);


/* ============================================================
   13. CALCULATE TOTALS
============================================================ */

function calculateTotals() {

    const totals = {};


    orderedPlayers.forEach(

        (player) => {

            totals[player.id] = 0;

        }

    );


    getMatches().forEach(

        (match) => {

            if (!match.scores) {
                return;
            }


            orderedPlayers.forEach(

                (player) => {

                    const score =
                        Number(
                            match.scores[player.id]
                        );


                    if (
                        Number.isFinite(score)
                    ) {

                        totals[player.id] +=
                            score;

                    }

                }

            );

        }

    );


    return totals;

}


/* ============================================================
   14. RENDER LIVE TOTALS
============================================================ */

function renderTotals() {

    totalsList.innerHTML =
        "";


    const totals =
        calculateTotals();


    const rankedPlayers =
        orderedPlayers
        .map(

            (player) => ({

                ...player,

                total:
                    totals[player.id] || 0

            })

        )
        .sort(

            (a, b) =>
                b.total - a.total

        );


    let previousScore =
        null;


    let previousRank =
        0;


    rankedPlayers.forEach(

        (player, index) => {

            let rank;


            if (
                previousScore !== null
                &&
                player.total === previousScore
            ) {

                rank =
                    previousRank;

            }

            else {

                rank =
                    index + 1;

            }


            previousScore =
                player.total;


            previousRank =
                rank;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "total-row";


            if (rank === 1) {

                row.classList.add(
                    "leader"
                );

            }


            row.innerHTML = `

                <div class="total-position">
                    ${rank}
                </div>

                <div class="total-player">

                    <strong>
                        ${escapeHTML(player.name)}
                    </strong>

                    <span>
                        ${getCompletedMatchCount()} matches
                    </span>

                </div>

                <div class="total-score">
                    ${formatScore(player.total)}
                </div>

            `;


            totalsList.appendChild(
                row
            );

        }

    );

}


/* ============================================================
   15. MATCH HISTORY
============================================================ */

function renderMatchHistory() {

    const matches =
        getMatches();


    if (matches.length === 0) {

        noMatchHistory.classList.remove(
            "hidden"
        );


        matchHistoryWrapper.classList.add(
            "hidden"
        );


        return;

    }


    noMatchHistory.classList.add(
        "hidden"
    );


    matchHistoryWrapper.classList.remove(
        "hidden"
    );


    /*
       Header
    */

    matchHistoryHead.innerHTML = `

        <tr>

            <th>
                Match
            </th>

            ${orderedPlayers
                .map(
                    player => `
                        <th>
                            ${escapeHTML(player.name)}
                        </th>
                    `
                )
                .join("")
            }

        </tr>

    `;


    /*
       Rows
    */

    matchHistoryBody.innerHTML =
        "";


    matches.forEach(

        (match) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    #${match.matchNumber}
                </td>

                ${orderedPlayers
                    .map(
                        player => `

                            <td>
                                ${
                                    formatScore(
                                        Number(
                                            match.scores?.[
                                                player.id
                                            ]
                                        )
                                    )
                                }
                            </td>

                        `
                    )
                    .join("")
                }

            `;


            matchHistoryBody.appendChild(
                row
            );

        }

    );

}


/* ============================================================
   16. COMPLETE GAME
============================================================ */

async function completeGame() {

    /*
       Read the game fresh because Match 10 was just written.
    */

    const gameRef =
        ref(
            database,
            `months/${monthId}/games/${gameId}`
        );


    const snapshot =
        await get(gameRef);


    if (!snapshot.exists()) {

        throw new Error(
            "Game disappeared before completion."
        );

    }


    const game =
        snapshot.val();


    const totals = {};


    orderedPlayers.forEach(

        (player) => {

            totals[player.id] =
                0;

        }

    );


    if (game.matches) {

        Object.values(
            game.matches
        )
        .forEach(

            (match) => {

                orderedPlayers.forEach(

                    (player) => {

                        const score =
                            Number(
                                match.scores?.[
                                    player.id
                                ]
                            );


                        if (
                            Number.isFinite(score)
                        ) {

                            totals[player.id] +=
                                score;

                        }

                    }

                );

            }

        );

    }


    const highestTotal =
        Math.max(
            ...Object.values(totals)
        );


    const winners =
        orderedPlayers.filter(

            (player) =>
                totals[player.id]
                ===
                highestTotal

        );


    const winnerData = {};


    winners.forEach(

        (player) => {

            winnerData[player.id] = {

                name:
                    player.name,

                total:
                    totals[player.id]

            };

        }

    );


    await update(

        gameRef,

        {

            status:
                "COMPLETED",

            completedMatches:
                10,

            currentMatchNumber:
                10,

            completedAt:
                Date.now(),

            updatedAt:
                Date.now(),

            finalTotals:
                totals,

            winners:
                winnerData,

            winningTotal:
                highestTotal

        }

    );


    localStorage.removeItem(
        "familyCardCurrentGame"
    );

}


/* ============================================================
   17. COMPLETED GAME DISPLAY
============================================================ */

function renderCompletedGame() {

    completedGameTitle.textContent =
        `Game #${currentGame.gameNumber}`;


    const totals =
        currentGame.finalTotals
        ||
        calculateTotals();


    const ranked =
        orderedPlayers
        .map(

            (player) => ({

                ...player,

                total:
                    Number(
                        totals[player.id]
                    ) || 0

            })

        )
        .sort(

            (a, b) =>
                b.total - a.total

        );


    const highestTotal =
        ranked.length
            ? ranked[0].total
            : 0;


    const winners =
        ranked.filter(

            player =>
                player.total
                ===
                highestTotal

        );


    winnerNames.textContent =
        winners
            .map(
                player => player.name
            )
            .join(" & ");


    winnerScore.textContent =
        `${formatScore(highestTotal)} points`;


    finalResults.innerHTML =
        "";


    let previousScore =
        null;


    let previousRank =
        0;


    ranked.forEach(

        (player, index) => {

            let rank;


            if (
                previousScore !== null
                &&
                player.total === previousScore
            ) {

                rank =
                    previousRank;

            }

            else {

                rank =
                    index + 1;

            }


            previousScore =
                player.total;


            previousRank =
                rank;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "final-result-row";


            row.innerHTML = `

                <div class="final-result-rank">
                    #${rank}
                </div>

                <div class="final-result-name">
                    ${escapeHTML(player.name)}
                </div>

                <div class="final-result-score">
                    ${formatScore(player.total)}
                </div>

            `;


            finalResults.appendChild(
                row
            );

        }

    );

}


/* ============================================================
   18. SCORE FORMATTER

   Examples:
   50       -> 50
   -12      -> -12
   20.5     -> 20.5
   15.75    -> 15.75
============================================================ */

function formatScore(
    value
) {

    if (
        !Number.isFinite(value)
    ) {

        return "—";

    }


    return new Intl.NumberFormat(

        "en-US",

        {

            maximumFractionDigits:
                10

        }

    ).format(value);

}


/* ============================================================
   19. INITIALS
============================================================ */

function getInitials(
    name
) {

    const words =
        name
        .trim()
        .split(/\s+/);


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
   20. HTML ESCAPE
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


/* ============================================================
   21. SCORE MESSAGES
============================================================ */

function showScoreMessage(
    message,
    type
) {

    scoreMessage.textContent =
        message;


    scoreMessage.className =
        `score-message ${type}`;

}


function clearScoreMessage() {

    scoreMessage.textContent =
        "";


    scoreMessage.className =
        "score-message";

}


/* ============================================================
   22. FATAL ERROR
============================================================ */

function showFatalError(
    message
) {

    loadingState.classList.add(
        "hidden"
    );


    activeGameContent.classList.add(
        "hidden"
    );


    completedGameCard.classList.add(
        "hidden"
    );


    errorMessage.textContent =
        message;


    errorState.classList.remove(
        "hidden"
    );

}