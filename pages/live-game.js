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
    runTransaction,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* ============================================================
   02. PAGE STATE
============================================================ */

let monthId = null;

let gameId = null;

let currentGame = null;

let orderedPlayers = [];

/* ============================================================
   MATCH COMMENTS - REGISTERED ACTIVE PLAYERS
============================================================ */

let activeCommentPlayers = [];

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

    /* ============================================================
   MATCH COMMENTS - DOM REFERENCES
============================================================ */

const matchCommentsArea =
    document.getElementById("matchCommentsArea");

const matchCommentsList =
    document.getElementById("matchCommentsList");


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


        listenToActiveCommentPlayers();

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

/* ============================================================
   LOAD ACTIVE PLAYERS FOR MATCH COMMENTS
============================================================ */

function listenToActiveCommentPlayers() {

    const playersRef = ref(database, "players");

    onValue(playersRef, (snapshot) => {

        activeCommentPlayers = [];

        if (snapshot.exists()) {

            snapshot.forEach((childSnapshot) => {

                const player = childSnapshot.val();

                if (player && player.active === true) {

                    activeCommentPlayers.push({
                        id: childSnapshot.key,
                        name: player.name
                    });

                }

            });

        }

        // Sort players alphabetically.
        activeCommentPlayers.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        // Refresh comment dropdowns when players change.
        if (currentGame) {
            renderMatchComments();
        }

    }, (error) => {

        console.error(
            "Unable to load active comment players:",
            error
        );

    });

}

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

// Keep saved match comments visible after game completion.
renderMatchComments();

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

    renderMatchComments();

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


   matches.forEach(match => {

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
   MATCH COMMENTS - DISPLAY CARDS
============================================================ */

/* ============================================================
   MATCH COMMENTS - SAVE TO FIREBASE
============================================================ */

/* ============================================================
   MATCH COMMENTS - 24 HOUR POSTING WINDOW
============================================================ */

function canPostMatchComments() {

    if (!currentGame) {
        return false;
    }

    if (currentGame.status === "ACTIVE") {
        return true;
    }

    if (currentGame.status !== "COMPLETED") {
        return false;
    }

    const completedAt = Number(currentGame.completedAt);

    if (!Number.isFinite(completedAt) || completedAt <= 0) {
        return false;
    }

    return Date.now() < completedAt + (24 * 60 * 60 * 1000);
}


async function saveMatchComment(matchNumber, playerId, text) {

    // Only active registered players can post.
    const player = activeCommentPlayers.find(
        p => String(p.id) === String(playerId)
    );

    if (!player) {
        throw new Error("Please select a valid player.");
    }

    const commentText = text.trim();

    if (!commentText || commentText.length > 300) {
        throw new Error("Comment must contain 1 to 300 characters.");
    }

    // Preserve the existing 24-hour commenting rule.
    if (!canPostMatchComments()) {
        throw new Error(
            "Commenting is closed. Comments are allowed for 24 hours after game completion."
        );
    }

    // Comments now belong to the GAME, not an individual match.
    const commentsRef = ref(
        database,
        `months/${monthId}/games/${gameId}/gameComments`
    );

    const newCommentRef = push(commentsRef);

    await set(newCommentRef, {
        playerId: String(player.id),
        playerName: player.name,
        text: commentText,
        createdAt: Date.now()
    });

}


function renderMatchComments() {

        const matches = getMatches();

    // Preserve unfinished comments before rebuilding the cards.
    const commentDrafts = {};

    matchCommentsList
        .querySelectorAll(".match-comment-card")
        .forEach((card) => {

            const matchNumber = card.dataset.matchNumber;

            const playerSelect =
                card.querySelector(".match-comment-select");

            const commentInput =
                card.querySelector(".match-comment-input");

            if (!matchNumber || !playerSelect || !commentInput) {
                return;
            }

            commentDrafts[matchNumber] = {
                playerId: playerSelect.value,
                text: commentInput.value
            };

        });

    matchCommentsList.innerHTML = "";

    // Game Comments belong to the whole game.
// Show them even before the first match is saved.
matchCommentsArea.classList.remove("hidden");

// One comment card for the entire game.
const gameCommentCard = [{ matchNumber: 1 }];

gameCommentCard.forEach((match) => {

        const card = document.createElement("div");

        card.className = "match-comment-card";

                card.dataset.matchNumber = String(match.matchNumber);

        // Collect all previously saved match comments
// and new game-level comments into one discussion.

const comments = {
    ...(currentGame.gameComments || {})
};

Object.values(currentGame.matchComments || {}).forEach(
    (matchComments, matchIndex) => {

        if (!matchComments || typeof matchComments !== "object") {
            return;
        }

        Object.entries(matchComments).forEach(
            ([commentId, comment]) => {

                comments[`legacy_${matchIndex}_${commentId}`] = comment;

            }
        );

    }
);

        const commentCount =
            Object.keys(comments).length;

        card.innerHTML = `

            <div class="match-comment-card-header">

                <strong class="match-comment-card-title">
    💬 Game Comments
</strong>

                <span class="match-comment-count">
                    💬 ${commentCount} comments
                </span>

            </div>

                        <div class="match-comment-messages">

                ${
                    commentCount === 0
                        ? `
                            <div class="match-comment-empty">
                                No comments yet. Be the first! 😄
                            </div>
                        `
                        : Object.values(comments)
                            .sort((a, b) =>
                                (a.createdAt || 0) - (b.createdAt || 0)
                            )
                            .map(comment => {

                                const playerName =
                                    escapeHTML(comment.playerName || "Player");

                                const message =
                                    escapeHTML(comment.text || "");

                                const time =
                                    Number.isFinite(comment.createdAt)
                                        ? new Date(comment.createdAt)
                                            .toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })
                                        : "";

                                return `
                                    <div class="match-comment-message">

                                        <div class="match-comment-message-header">

                                            <strong>
                                                ${playerName}
                                            </strong>

                                            <span>
                                                ${time}
                                            </span>

                                        </div>

                                        <div class="match-comment-message-text">${message}</div>

                                    </div>
                                `;

                            }).join("")
                }

            </div>

                        <div class="match-comment-form">

                <label class="match-comment-label">
                    Comment as
                </label>

                <select class="match-comment-select">
                    <option value="">Select player</option>

                    ${activeCommentPlayers.map(player => `
    <option value="${escapeHTML(player.id)}">
        ${escapeHTML(player.name)}
    </option>
`).join("")}

                </select>

                <label class="match-comment-label">
                    Your comment
                </label>

                <textarea
                    class="match-comment-input"
                    rows="3"
                    maxlength="300"
                    placeholder="Write something about this game..."
                ></textarea>

                <div class="match-emoji-row">

                    ${["😂", "🔥", "👏", "❤️", "😎", "🏆", "😢", "😮"].map(emoji => `
                        <button
                            type="button"
                            class="match-emoji-button"
                            data-emoji="${emoji}"
                        >${emoji}</button>
                    `).join("")}

                </div>

                <button
    type="button"
    class="match-comment-submit"
    disabled
>
    Post Comment
</button>

            </div>

        `;

        matchCommentsList.appendChild(card);

                /* ====================================================
           EMOJI BUTTONS - MATCH COMMENTS
        ==================================================== */

        const commentInput =
            card.querySelector(".match-comment-input");
                    const playerSelect =
            card.querySelector(".match-comment-select");

        const submitButton =
            card.querySelector(".match-comment-submit");

                    // Restore the unfinished comment for this match.
        const savedDraft = commentDrafts[match.matchNumber];

        if (savedDraft) {

            playerSelect.value = savedDraft.playerId;

            commentInput.value = savedDraft.text;

        }

        // Enable Post Comment only when the form is complete.
        function updateCommentButton() {

    const commentingOpen = canPostMatchComments();

    const hasPlayer = playerSelect.value !== "";

    const hasComment =
        commentInput.value.trim().length > 0;

    playerSelect.disabled = !commentingOpen;
    commentInput.disabled = !commentingOpen;

    submitButton.disabled =
        !commentingOpen || !hasPlayer || !hasComment;

    submitButton.textContent = commentingOpen
        ? "Post Comment"
        : "Commenting Closed";

    card.querySelectorAll(".match-emoji-button")
        .forEach(button => {
            button.disabled = !commentingOpen;
        });
}

        playerSelect.addEventListener(
            "change",
            updateCommentButton
        );

        commentInput.addEventListener(
            "input",
            updateCommentButton
        );

                // Restore the correct button state after rebuilding.
        updateCommentButton();

                // Save the comment when Post Comment is clicked.
        submitButton.addEventListener("click", async () => {

            if (submitButton.disabled) {
                return;
            }

            const selectedPlayerId = playerSelect.value;
            const commentText = commentInput.value.trim();

            submitButton.disabled = true;
            submitButton.textContent = "Posting...";

            try {

                await saveMatchComment(
                    match.matchNumber,
                    selectedPlayerId,
                    commentText
                );

                // Clear only this match's comment form.
                playerSelect.value = "";
                commentInput.value = "";

                updateCommentButton();

            } catch (error) {

                console.error("Failed to post comment:", error);

                alert(
                    error.message ||
                    "Unable to post comment. Please try again."
                );

                updateCommentButton();

            } finally {

                submitButton.textContent = "Post Comment";

            }

        });

        const emojiButtons =
            card.querySelectorAll(".match-emoji-button");

        emojiButtons.forEach((button) => {

            button.addEventListener("click", () => {

                const emoji = button.dataset.emoji;

                if (!commentInput || !emoji) {
                    return;
                }

                const start = commentInput.selectionStart;
                const end = commentInput.selectionEnd;

                commentInput.setRangeText(
                    emoji,
                    start,
                    end,
                    "end"
                );

                commentInput.focus();
                                updateCommentButton();

            });

        });

    });

}

/* ============================================================
   MATCH COMMENTS - AUTOMATIC EXPIRY
============================================================ */

setInterval(() => {

    if (!currentGame || currentGame.status !== "COMPLETED") {
        return;
    }

    const commentingOpen = canPostMatchComments();

    if (!commentingOpen) {

        document.querySelectorAll(".match-comment-card")
            .forEach(card => {

                const playerSelect =
                    card.querySelector(".match-comment-select");

                const commentInput =
                    card.querySelector(".match-comment-input");

                const submitButton =
                    card.querySelector(".match-comment-submit");

                if (playerSelect) playerSelect.disabled = true;
                if (commentInput) commentInput.disabled = true;

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = "Commenting Closed";
                }

                card.querySelectorAll(".match-emoji-button")
                    .forEach(button => {
                        button.disabled = true;
                    });
            });
    }

}, 10000);

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