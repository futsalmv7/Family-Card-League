/* ============================================================
   FAMILY CARD LEAGUE
   PLAYERS PAGE

   Responsibilities:
   01. Firebase imports
   02. DOM references
   03. Live player listener
   04. Add player
   05. Duplicate checking
   06. Activate / deactivate player
   07. Render player list
   08. Update summary
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
    push,
    set,
    update,
    onValue,
    get
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* ============================================================
   02. DOM REFERENCES
============================================================ */

const addPlayerForm =
    document.getElementById("addPlayerForm");


const playerNameInput =
    document.getElementById("playerNameInput");


const addPlayerButton =
    document.getElementById("addPlayerButton");


const formMessage =
    document.getElementById("formMessage");


const playersList =
    document.getElementById("playersList");


const playersLoadingState =
    document.getElementById("playersLoadingState");


const playersEmptyState =
    document.getElementById("playersEmptyState");


const totalPlayersCount =
    document.getElementById("totalPlayersCount");


const activePlayersCount =
    document.getElementById("activePlayersCount");


const inactivePlayersCount =
    document.getElementById("inactivePlayersCount");



/* ============================================================
   03. LOCAL PAGE DATA
============================================================ */

let currentPlayers = [];



/* ============================================================
   04. DATABASE REFERENCES
============================================================ */

const playersRef =
    ref(database, "players");



/* ============================================================
   05. LIVE PLAYER LISTENER

   Whenever Firebase changes, this automatically runs again.

   This means:
   - New players appear immediately.
   - Status changes appear immediately.
   - Another phone sees the changes without refreshing.
============================================================ */

onValue(

    playersRef,

    (snapshot) => {

        currentPlayers = [];


        if (snapshot.exists()) {

            snapshot.forEach((childSnapshot) => {

                const playerData =
                    childSnapshot.val();


                currentPlayers.push({

                    id:
                        childSnapshot.key,

                    ...playerData

                });

            });

        }


        sortPlayers();

        renderPlayers();

        updatePlayerSummary();

    },

    (error) => {

        console.error(
            "Unable to load players:",
            error
        );


        playersLoadingState.classList.add(
            "hidden"
        );


        showMessage(
            "Could not load players. Check your Firebase connection.",
            "error"
        );

    }

);



/* ============================================================
   06. ADD PLAYER FORM
============================================================ */

addPlayerForm.addEventListener(

    "submit",

    async (event) => {

        event.preventDefault();


        clearMessage();


        const playerName =
            cleanPlayerName(
                playerNameInput.value
            );


        /* --------------------------------------------
           Basic validation
        --------------------------------------------- */

        if (!playerName) {

            showMessage(
                "Please enter a player name.",
                "error"
            );

            return;

        }


        if (playerName.length < 2) {

            showMessage(
                "Player name must contain at least 2 characters.",
                "error"
            );

            return;

        }


        /* --------------------------------------------
           Duplicate player check

           Comparison is case-insensitive.

           Hassan and HASSAN cannot both be created.
        --------------------------------------------- */

        const duplicatePlayer =
            currentPlayers.find(

                (player) =>

                    normalizeName(player.name)
                    ===
                    normalizeName(playerName)

            );


        if (duplicatePlayer) {

            showMessage(
                `${duplicatePlayer.name} already exists.`,
                "error"
            );

            return;

        }


        /* --------------------------------------------
           Save player
        --------------------------------------------- */

        try {

            setFormBusy(true);


            const newPlayerRef =
                push(playersRef);


            const now =
                Date.now();


            const newPlayer = {

                name:
                    playerName,

                active:
                    true,

                createdAt:
                    now,

                updatedAt:
                    now

            };


            await set(
                newPlayerRef,
                newPlayer
            );


            playerNameInput.value =
                "";


            showMessage(
                `${playerName} added successfully.`,
                "success"
            );


            playerNameInput.focus();

        }

        catch (error) {

            console.error(
                "Error adding player:",
                error
            );


            showMessage(
                "Player could not be added.",
                "error"
            );

        }

        finally {

            setFormBusy(false);

        }

    }

);



/* ============================================================
   07. SORT PLAYERS

   Active players appear first.

   Within each group, names are alphabetical.
============================================================ */

function sortPlayers() {

    currentPlayers.sort(

        (playerA, playerB) => {

            if (
                playerA.active
                !==
                playerB.active
            ) {

                return playerA.active
                    ? -1
                    : 1;

            }


            return playerA.name.localeCompare(
                playerB.name
            );

        }

    );

}



/* ============================================================
   08. RENDER PLAYER LIST
============================================================ */

function renderPlayers() {

    playersLoadingState.classList.add(
        "hidden"
    );


    playersList.innerHTML =
        "";


    if (currentPlayers.length === 0) {

        playersEmptyState.classList.remove(
            "hidden"
        );


        playersList.classList.add(
            "hidden"
        );


        return;

    }


    playersEmptyState.classList.add(
        "hidden"
    );


    playersList.classList.remove(
        "hidden"
    );


    currentPlayers.forEach(

        (player) => {

            const playerRow =
                createPlayerRow(player);


            playersList.appendChild(
                playerRow
            );

        }

    );

}



/* ============================================================
   09. CREATE PLAYER ROW
============================================================ */

function createPlayerRow(player) {

    const row =
        document.createElement("div");


    row.className =
        "player-row";


    /* --------------------------------------------
       Player Initials
    --------------------------------------------- */

    const avatar =
        document.createElement("div");


    avatar.className =
        "player-avatar";


    avatar.textContent =
        getInitials(player.name);



    /* --------------------------------------------
       Player Information
    --------------------------------------------- */

    const info =
        document.createElement("div");


    info.className =
        "player-info";


    const name =
        document.createElement("div");


    name.className =
        "player-name";


    name.textContent =
        player.name;


    const meta =
        document.createElement("div");


    meta.className =
        "player-meta";


    const status =
        document.createElement("span");


    status.className =
        player.active
            ? "status-badge status-active"
            : "status-badge status-inactive";


    status.textContent =
        player.active
            ? "Active"
            : "Inactive";


    const joined =
        document.createElement("span");


    joined.textContent =
        `Added ${formatDate(player.createdAt)}`;


    meta.appendChild(
        status
    );


    meta.appendChild(
        joined
    );


    info.appendChild(
        name
    );


    info.appendChild(
        meta
    );



    /* --------------------------------------------
       Action Button
    --------------------------------------------- */

    const actions =
        document.createElement("div");


    actions.className =
        "player-actions";


    const statusButton =
        document.createElement("button");


    statusButton.type =
        "button";


    statusButton.className =
        player.active
            ? "player-action-button deactivate"
            : "player-action-button activate";


    statusButton.textContent =
        player.active
            ? "Deactivate"
            : "Activate";


    statusButton.addEventListener(

        "click",

        () => {

            togglePlayerStatus(player);

        }

    );


    actions.appendChild(
        statusButton
    );



    /* --------------------------------------------
       Assemble Player Row
    --------------------------------------------- */

    row.appendChild(
        avatar
    );


    row.appendChild(
        info
    );


    row.appendChild(
        actions
    );


    return row;

}



/* ============================================================
   10. ACTIVATE / DEACTIVATE PLAYER
============================================================ */

async function togglePlayerStatus(player) {

    const newStatus =
        !player.active;


    const actionWord =
        newStatus
            ? "activate"
            : "deactivate";


    const confirmed =
        window.confirm(
            `Do you want to ${actionWord} ${player.name}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const playerRef =
            ref(
                database,
                `players/${player.id}`
            );


        await update(

            playerRef,

            {

                active:
                    newStatus,

                updatedAt:
                    Date.now()

            }

        );


        showMessage(
            `${player.name} is now ${newStatus ? "active" : "inactive"}.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Unable to change player status:",
            error
        );


        showMessage(
            "Player status could not be changed.",
            "error"
        );

    }

}



/* ============================================================
   11. PLAYER SUMMARY
============================================================ */

function updatePlayerSummary() {

    const total =
        currentPlayers.length;


    const active =
        currentPlayers.filter(
            (player) => player.active
        ).length;


    const inactive =
        total - active;


    totalPlayersCount.textContent =
        total;


    activePlayersCount.textContent =
        active;


    inactivePlayersCount.textContent =
        inactive;

}



/* ============================================================
   12. CLEAN PLAYER NAME

   Example:

   "   Hassan   Jaufar "
   becomes
   "Hassan Jaufar"
============================================================ */

function cleanPlayerName(name) {

    return name
        .trim()
        .replace(/\s+/g, " ");

}



/* ============================================================
   13. NORMALIZE NAME FOR DUPLICATE CHECK
============================================================ */

function normalizeName(name) {

    return cleanPlayerName(name)
        .toLocaleLowerCase();

}



/* ============================================================
   14. PLAYER INITIALS

   Hassan Jaufar -> HJ
   Hassan -> H
============================================================ */

function getInitials(name) {

    const words =
        cleanPlayerName(name)
        .split(" ");


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0)
        +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}



/* ============================================================
   15. FORMAT DATE
============================================================ */

function formatDate(timestamp) {

    if (!timestamp) {

        return "Unknown";

    }


    const date =
        new Date(timestamp);


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
   16. FORM BUSY STATE
============================================================ */

function setFormBusy(isBusy) {

    addPlayerButton.disabled =
        isBusy;


    playerNameInput.disabled =
        isBusy;


    addPlayerButton.textContent =
        isBusy
            ? "Adding..."
            : "Add Player";

}



/* ============================================================
   17. FORM MESSAGES
============================================================ */

function showMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;

}



function clearMessage() {

    formMessage.textContent =
        "";


    formMessage.className =
        "form-message";

}