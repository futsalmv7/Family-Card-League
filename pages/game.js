/* ============================================================
   FAMILY CARD LEAGUE
   START NEW GAME

   Responsibilities:
   01. Firebase imports
   02. Page state
   03. Active month
   04. Load active players
   05. Select exactly 4 players
   06. Determine next game number
   07. Create game safely
   08. UI helpers
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
    get,
    set,
    push,
    onValue,
    runTransaction
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";



/* ============================================================
   02. PAGE STATE
============================================================ */

let activePlayers = [];

let selectedPlayers = [];

let activeMonth = null;

let nextGamePreview = 1;

let gameIsBeingCreated = false;



/* ============================================================
   03. DOM REFERENCES
============================================================ */

const activeMonthLabel =
    document.getElementById(
        "activeMonthLabel"
    );


const gameMonthDisplay =
    document.getElementById(
        "gameMonthDisplay"
    );


const nextGameNumberDisplay =
    document.getElementById(
        "nextGameNumberDisplay"
    );


const selectionCounter =
    document.getElementById(
        "selectionCounter"
    );


const playerSelectionGrid =
    document.getElementById(
        "playerSelectionGrid"
    );


const playersLoading =
    document.getElementById(
        "playersLoading"
    );


const noPlayersMessage =
    document.getElementById(
        "noPlayersMessage"
    );


const startGameButton =
    document.getElementById(
        "startGameButton"
    );


const startSummary =
    document.getElementById(
        "startSummary"
    );


const gameMessage =
    document.getElementById(
        "gameMessage"
    );


const gameCreatedPanel =
    document.getElementById(
        "gameCreatedPanel"
    );


const createdGameNumber =
    document.getElementById(
        "createdGameNumber"
    );


const createdGamePlayers =
    document.getElementById(
        "createdGamePlayers"
    );

    const openCreatedGameButton =
    document.getElementById(
        "openCreatedGameButton"
    );


/* ============================================================
   04. INITIALIZE PAGE
============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await initializeActiveMonth();

            await loadNextGamePreview();

            listenForPlayers();

        }

        catch (error) {

            console.error(
                "Unable to initialize game page:",
                error
            );


            showMessage(
                "The game page could not be initialized.",
                "error"
            );

        }

    }

);



/* ============================================================
   05. ACTIVE MONTH

   For now:

   If Firebase has no active month yet, the portal automatically
   creates one using the current calendar month.

   Later the ADMIN page will control:
   - Finalize Month
   - Reopen Month
   - Start Next Month
============================================================ */

async function initializeActiveMonth() {

    const activeMonthRef =
        ref(
            database,
            "settings/activeMonth"
        );


    const snapshot =
        await get(activeMonthRef);


    if (snapshot.exists()) {

        activeMonth =
            snapshot.val();

    }

    else {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const monthNumber =
            now.getMonth() + 1;


        const monthId =
            `${year}-${String(monthNumber).padStart(2, "0")}`;


        const monthLabel =
            now.toLocaleDateString(

                "en-US",

                {
                    month: "long",
                    year: "numeric"
                }

            );


        activeMonth = {

            id:
                monthId,

            label:
                monthLabel,

            year:
                year,

            month:
                monthNumber,

            status:
                "ACTIVE",

            createdAt:
                Date.now()

        };


        await set(

            activeMonthRef,

            activeMonth

        );


        /*
           Create the month information too.
        */

        const monthInfoRef =
            ref(
                database,
                `months/${monthId}/info`
            );


        await set(

            monthInfoRef,

            {

                label:
                    monthLabel,

                year:
                    year,

                month:
                    monthNumber,

                status:
                    "ACTIVE",

                createdAt:
                    Date.now()

            }

        );

    }


    displayActiveMonth();

}



/* ============================================================
   06. DISPLAY ACTIVE MONTH
============================================================ */

function displayActiveMonth() {

    if (!activeMonth) {
        return;
    }


    activeMonthLabel.textContent =
        activeMonth.label;


    gameMonthDisplay.textContent =
        activeMonth.label;

}



/* ============================================================
   07. NEXT GAME PREVIEW

   This is only a preview.

   The real number is assigned using a Firebase transaction
   when START GAME is pressed.
============================================================ */

async function loadNextGamePreview() {

    if (!activeMonth) {
        return;
    }


    const counterRef =
        ref(
            database,
            `months/${activeMonth.id}/lastGameNumber`
        );


    const snapshot =
        await get(
            counterRef
        );


    const lastNumber =
        snapshot.exists()
            ? Number(snapshot.val()) || 0
            : 0;


    nextGamePreview =
        lastNumber + 1;


    nextGameNumberDisplay.textContent =
        `#${nextGamePreview}`;

}

/* ============================================================
   08. LOAD ACTIVE PLAYERS LIVE
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

            activePlayers = [];


            if (snapshot.exists()) {

                snapshot.forEach(

                    (childSnapshot) => {

                        const player =
                            childSnapshot.val();


                        if (player.active === true) {

                            activePlayers.push({

                                id:
                                    childSnapshot.key,

                                name:
                                    player.name

                            });

                        }

                    }

                );

            }


            activePlayers.sort(

                (a, b) =>
                    a.name.localeCompare(b.name)

            );


            /*
               Remove selected players if somebody is
               deactivated from another device.
            */

            selectedPlayers =
                selectedPlayers.filter(

                    (selectedPlayer) =>

                        activePlayers.some(

                            (activePlayer) =>
                                activePlayer.id
                                ===
                                selectedPlayer.id

                        )

                );


            renderPlayerSelection();

            updateSelectedPlayerSlots();

            updateStartGameState();

        },

        (error) => {

            console.error(
                "Could not load players:",
                error
            );


            playersLoading.classList.add(
                "hidden"
            );


            showMessage(
                "Unable to load players.",
                "error"
            );

        }

    );

}



/* ============================================================
   09. RENDER PLAYER SELECTION
============================================================ */

function renderPlayerSelection() {

    playersLoading.classList.add(
        "hidden"
    );


    playerSelectionGrid.innerHTML =
        "";


    if (activePlayers.length < 4) {

        noPlayersMessage.classList.remove(
            "hidden"
        );


        playerSelectionGrid.classList.add(
            "hidden"
        );


        return;

    }


    noPlayersMessage.classList.add(
        "hidden"
    );


    playerSelectionGrid.classList.remove(
        "hidden"
    );


    activePlayers.forEach(

        (player) => {

            const card =
                createPlayerCard(player);


            playerSelectionGrid.appendChild(
                card
            );

        }

    );

}



/* ============================================================
   10. CREATE PLAYER SELECTION CARD
============================================================ */

function createPlayerCard(player) {

    const selected =
        isPlayerSelected(player.id);


    const selectionIsFull =
        selectedPlayers.length >= 4;


    const card =
        document.createElement("button");


    card.type =
        "button";


    card.className =
        "player-select-card";


    if (selected) {

        card.classList.add(
            "selected"
        );

    }


    if (
        selectionIsFull
        &&
        !selected
    ) {

        card.classList.add(
            "disabled"
        );

    }


    const avatar =
        document.createElement("div");


    avatar.className =
        "player-select-avatar";


    avatar.textContent =
        getInitials(player.name);



    const name =
        document.createElement("div");


    name.className =
        "player-select-name";


    name.textContent =
        player.name;



    const check =
        document.createElement("div");


    check.className =
        "player-selected-check";


    check.textContent =
        "✓";



    card.appendChild(
        avatar
    );


    card.appendChild(
        name
    );


    card.appendChild(
        check
    );



    card.addEventListener(

        "click",

        () => {

            togglePlayerSelection(
                player
            );

        }

    );


    return card;

}



/* ============================================================
   11. SELECT / DESELECT PLAYER
============================================================ */

function togglePlayerSelection(player) {

    if (gameIsBeingCreated) {
        return;
    }


    const existingIndex =
        selectedPlayers.findIndex(

            (selectedPlayer) =>
                selectedPlayer.id
                ===
                player.id

        );


    /*
       Player already selected:
       remove them.
    */

    if (existingIndex !== -1) {

        selectedPlayers.splice(
            existingIndex,
            1
        );

    }

    /*
       Player not selected:
       add if fewer than four selected.
    */

    else {

        if (selectedPlayers.length >= 4) {

            showMessage(
                "A game can only have 4 players.",
                "error"
            );


            return;

        }


        selectedPlayers.push(
            player
        );

    }


    clearMessage();

    renderPlayerSelection();

    updateSelectedPlayerSlots();

    updateStartGameState();

}



/* ============================================================
   12. IS PLAYER SELECTED?
============================================================ */

function isPlayerSelected(playerId) {

    return selectedPlayers.some(

        (player) =>
            player.id === playerId

    );

}



/* ============================================================
   13. UPDATE SELECTED PLAYER SLOTS
============================================================ */

function updateSelectedPlayerSlots() {

    for (
        let index = 0;
        index < 4;
        index++
    ) {

        const slot =
            document.getElementById(
                `selectedSlot${index + 1}`
            );


        const player =
            selectedPlayers[index];


        const seatNumber =
            index + 1;


        if (player) {

            slot.classList.add(
                "filled"
            );


            slot.innerHTML = `

                <span class="seat-number">
                    ${seatNumber}
                </span>

                <div>

                    <strong>
                        ${escapeHTML(player.name)}
                    </strong>

                    <small>
                        Seat ${seatNumber}
                    </small>

                </div>

            `;

        }

        else {

            slot.classList.remove(
                "filled"
            );


            slot.innerHTML = `

                <span class="seat-number">
                    ${seatNumber}
                </span>

                <div>

                    <strong>
                        Select Player
                    </strong>

                    <small>
                        Seat ${seatNumber}
                    </small>

                </div>

            `;

        }

    }


    selectionCounter.textContent =
        `${selectedPlayers.length} / 4`;


    if (selectedPlayers.length === 4) {

        selectionCounter.classList.add(
            "complete"
        );

    }

    else {

        selectionCounter.classList.remove(
            "complete"
        );

    }

}



/* ============================================================
   14. UPDATE START BUTTON
============================================================ */

function updateStartGameState() {

    const ready =
        selectedPlayers.length === 4;


    startGameButton.disabled =
        !ready
        ||
        gameIsBeingCreated;


    if (ready) {

        startSummary.textContent =
            selectedPlayers
                .map(
                    player => player.name
                )
                .join(" • ");

    }

    else {

        const remaining =
            4 - selectedPlayers.length;


        startSummary.textContent =
            remaining === 1
                ? "Select 1 more player"
                : `Select ${remaining} more players`;

    }

}



/* ============================================================
   15. START GAME BUTTON
============================================================ */

startGameButton.addEventListener(

    "click",

    async () => {

        if (
            selectedPlayers.length !== 4
        ) {

            showMessage(
                "Please select exactly 4 players.",
                "error"
            );


            return;

        }


        if (
            !activeMonth
            ||
            activeMonth.status !== "ACTIVE"
        ) {

            showMessage(
                "There is currently no active month.",
                "error"
            );


            return;

        }


        try {

            gameIsBeingCreated =
                true;


            updateStartGameState();


            startGameButton.textContent =
                "Creating Game...";


            clearMessage();

/* ==================================================
   CHECK FOR EXISTING ACTIVE GAME

   This check happens immediately before creating
   another game.

   It prevents Game #3 being created while Game #2
   is still ACTIVE.
================================================== */

const existingActiveGame =
    await findExistingActiveGame(
        activeMonth.id
    );


if (existingActiveGame) {

    const existingGameNumber =
        existingActiveGame.gameNumber
        || "?";


    const completedMatches =
        Number(
            existingActiveGame.completedMatches
        ) || 0;


    const nextMatch =
        Math.min(
            completedMatches + 1,
            10
        );


    gameIsBeingCreated =
        false;


    startGameButton.textContent =
        "Start Game";


    updateStartGameState();


    const shouldContinue =
        window.confirm(

            `Game #${existingGameNumber} is already active.\n\n`
            +
            `Current progress: Match ${nextMatch} of 10.\n\n`
            +
            `Only one game can be active at a time.\n\n`
            +
            `Press OK to continue Game #${existingGameNumber}.`

        );


    if (shouldContinue) {

        window.location.href =
            `live-game.html?month=${encodeURIComponent(
                activeMonth.id
            )}&game=${encodeURIComponent(
                existingActiveGame.id
            )}`;

    }


    return;

}

            /* ==================================================
               RESERVE NEXT GAME NUMBER

               Firebase transaction prevents two phones from
               receiving the same game number.
            ================================================== */

            const counterRef =
                ref(
                    database,
                    `months/${activeMonth.id}/lastGameNumber`
                );


            const transactionResult =
                await runTransaction(

                    counterRef,

                    (currentValue) => {

                        const currentNumber =
                            Number(
                                currentValue
                            ) || 0;


                        return currentNumber + 1;

                    }

                );


            if (
                !transactionResult.committed
            ) {

                throw new Error(
                    "Game number transaction failed."
                );

            }


            const gameNumber =
                transactionResult
                    .snapshot
                    .val();



            /* ==================================================
               CREATE FIREBASE GAME ID
            ================================================== */

            const gamesRef =
                ref(
                    database,
                    `months/${activeMonth.id}/games`
                );


            const newGameRef =
                push(gamesRef);


            const gameId =
                newGameRef.key;


            const now =
                Date.now();



            /* ==================================================
               PLAYER SNAPSHOT

               We save player names inside the game too.

               This means old games remain readable even if
               a player's profile changes later.
            ================================================== */

            const gamePlayers = {};


            selectedPlayers.forEach(

                (player, index) => {

                    gamePlayers[player.id] = {

                        name:
                            player.name,

                        seat:
                            index + 1

                    };

                }

            );



            /* ==================================================
               CREATE GAME
            ================================================== */

            const gameData = {

                gameNumber:
                    gameNumber,

                monthId:
                    activeMonth.id,

                monthLabel:
                    activeMonth.label,

                status:
                    "ACTIVE",

                totalMatches:
                    10,

                completedMatches:
                    0,

                currentMatchNumber:
                    1,

                createdAt:
                    now,

                startedAt:
                    now,

                updatedAt:
                    now,

                completedAt:
                    null,

                cancelledAt:
                    null,

                players:
                    gamePlayers

            };


            await set(

                newGameRef,

                gameData

            );



            /* ==================================================
               SUCCESS
            ================================================== */

            showCreatedGame(

                gameNumber,
                gameId

            );

        }

        catch (error) {

            console.error(
                "Could not create game:",
                error
            );


            showMessage(
                "Game could not be created. Please try again.",
                "error"
            );


            gameIsBeingCreated =
                false;


            startGameButton.textContent =
                "Start Game";


            updateStartGameState();

        }

    }

);

/* ============================================================
   CHECK FOR EXISTING ACTIVE GAME

   For now the league allows only one ACTIVE game at a time.
============================================================ */

async function findExistingActiveGame(
    monthId
) {

    const gamesRef =
        ref(
            database,
            `months/${monthId}/games`
        );


    const snapshot =
        await get(
            gamesRef
        );


    if (!snapshot.exists()) {

        return null;

    }


    const games =
        snapshot.val();


    for (
        const [gameId, game]
        of Object.entries(games)
    ) {

        if (
            game
            &&
            game.status === "ACTIVE"
        ) {

            return {

                id:
                    gameId,

                ...game

            };

        }

    }


    return null;

}


/* ============================================================
   16. SHOW CREATED GAME
============================================================ */

function showCreatedGame(
    gameNumber,
    gameId
) {

    /*
       Hide game creation sections.
    */

    document
        .querySelectorAll(
            ".game-info-grid, .game-content-card, .start-game-action-card"
        )
        .forEach(

            element => {

                element.classList.add(
                    "hidden"
                );

            }

        );


    createdGameNumber.textContent =
        `Game #${gameNumber}`;


    createdGamePlayers.textContent =
        selectedPlayers
            .map(
                player => player.name
            )
            .join(" • ");


    gameCreatedPanel.classList.remove(
        "hidden"
    );


    /*
       Save current game reference locally too.

       This is useful for the next step when we create
       the score-entry page.
    */

    localStorage.setItem(

        "familyCardCurrentGame",

        JSON.stringify({

            monthId:
                activeMonth.id,

            gameId:
                gameId,

            gameNumber:
                gameNumber

        })

    );

    openCreatedGameButton.href =
    `live-game.html?month=${encodeURIComponent(activeMonth.id)}&game=${encodeURIComponent(gameId)}`;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



/* ============================================================
   17. PLAYER INITIALS
============================================================ */

function getInitials(name) {

    const parts =
        name
            .trim()
            .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0)
        +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();

}



/* ============================================================
   18. HTML ESCAPING

   Prevents player names from accidentally inserting HTML.
============================================================ */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}



/* ============================================================
   19. MESSAGES
============================================================ */

function showMessage(
    text,
    type
) {

    gameMessage.textContent =
        text;


    gameMessage.className =
        `game-form-message ${type}`;

}



function clearMessage() {

    gameMessage.textContent =
        "";


    gameMessage.className =
        "game-form-message";

}