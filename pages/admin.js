/* ============================================================
   FAMILY CARD LEAGUE
   ADMIN PAGE

   Step 11C-1

   Responsibilities:
   01. Admin password unlock
   02. Session unlock state
   03. Lock admin
   04. Load active month from Firebase
   05. Count ACTIVE / COMPLETED games
   06. Show finalized months
   07. No Firebase writes yet
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
    update,
    push,
    set
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";



/* ============================================================
   02. ADMIN PASSWORD

   Keep the same password you used in Step 11B-1.
============================================================ */

const ADMIN_PASSWORD =
    "family123";


/* ============================================================
   03. SESSION STORAGE KEY
============================================================ */

const ADMIN_SESSION_KEY =
    "familyCardAdminUnlocked";



/* ============================================================
   04. DOM REFERENCES
============================================================ */

const adminLoginSection =
    document.getElementById(
        "adminLoginSection"
    );


const adminDashboard =
    document.getElementById(
        "adminDashboard"
    );


const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


const adminPasswordInput =
    document.getElementById(
        "adminPasswordInput"
    );


const adminLoginError =
    document.getElementById(
        "adminLoginError"
    );


const adminLogoutButton =
    document.getElementById(
        "adminLogoutButton"
    );


const adminActiveMonthLabel =
    document.getElementById(
        "adminActiveMonthLabel"
    );


const adminActiveMonthStatus =
    document.getElementById(
        "adminActiveMonthStatus"
    );


const adminCompletedGamesCount =
    document.getElementById(
        "adminCompletedGamesCount"
    );


const adminActiveGamesCount =
    document.getElementById(
        "adminActiveGamesCount"
    );

    const adminActiveGamesList =
    document.getElementById(
        "adminActiveGamesList"
    );

    const adminCompletedGamesList =
    document.getElementById(
        "adminCompletedGamesList"
    );

    const adminGameEditorSection =
    document.getElementById(
        "adminGameEditorSection"
    );


const adminGameEditorTitle =
    document.getElementById(
        "adminGameEditorTitle"
    );


const adminGameEditorSubtitle =
    document.getElementById(
        "adminGameEditorSubtitle"
    );


const adminGameEditorPlayers =
    document.getElementById(
        "adminGameEditorPlayers"
    );


const adminGameEditorMatches =
    document.getElementById(
        "adminGameEditorMatches"
    );

    const adminGameEditorSaveButton =
    document.getElementById(
        "adminGameEditorSaveButton"
    );

const adminGameEditorCloseButton =
    document.getElementById(
        "adminGameEditorCloseButton"
    );

const adminFinalizedMonthsList =
    document.getElementById(
        "adminFinalizedMonthsList"
    );

    const adminHistoricalCorrectionSection =
    document.getElementById(
        "adminHistoricalCorrectionSection"
    );


const adminHistoricalCorrectionTitle =
    document.getElementById(
        "adminHistoricalCorrectionTitle"
    );


const adminHistoricalCorrectionSubtitle =
    document.getElementById(
        "adminHistoricalCorrectionSubtitle"
    );


const adminHistoricalCorrectionStatus =
    document.getElementById(
        "adminHistoricalCorrectionStatus"
    );


const adminHistoricalCompletedCount =
    document.getElementById(
        "adminHistoricalCompletedCount"
    );


const adminHistoricalCancelledCount =
    document.getElementById(
        "adminHistoricalCancelledCount"
    );


const adminHistoricalCompletedGamesList =
    document.getElementById(
        "adminHistoricalCompletedGamesList"
    );


const adminHistoricalCancelledGamesList =
    document.getElementById(
        "adminHistoricalCancelledGamesList"
    );

const adminHistoricalRefinalizeButton =
    document.getElementById(
        "adminHistoricalRefinalizeButton"
    );

const adminHistoricalCorrectionCloseButton =
    document.getElementById(
        "adminHistoricalCorrectionCloseButton"
    );

const adminFinalizeMonthButton =
    document.getElementById(
        "adminFinalizeMonthButton"
    );

const adminStartNextMonthButton =
    document.getElementById(
        "adminStartNextMonthButton"
    );

/* ============================================================
   PLAYER MANAGEMENT DOM
============================================================ */

const adminTotalPlayersCount =
    document.getElementById(
        "adminTotalPlayersCount"
    );


const adminActivePlayersCount =
    document.getElementById(
        "adminActivePlayersCount"
    );


const adminInactivePlayersCount =
    document.getElementById(
        "adminInactivePlayersCount"
    );


const adminPlayersList =
    document.getElementById(
        "adminPlayersList"
    );


const adminPlayerNameInput =
    document.getElementById(
        "adminPlayerNameInput"
    );


const adminAddPlayerButton =
    document.getElementById(
        "adminAddPlayerButton"
    );

    adminAddPlayerButton.addEventListener(

    "click",

    () => {

        addPlayerFromAdmin();

    }

);


adminPlayerNameInput.addEventListener(

    "keydown",

    (event) => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            addPlayerFromAdmin();

        }

    }

);

/* ============================================================
   05. PAGE STATE
============================================================ */

let activeMonthId =
    null;


let activeMonthData =
    null;


let allMonths =
    [];

    let allPlayers =
    [];

    let editingGameId =
    null;


let editingGameData =
    null;

    let editingGameMonthId =
    null;


let editingGameMonthData =
    null;

    let historicalCorrectionMonthId =
    null;


let historicalCorrectionMonthData =
    null;



/* ============================================================
   06. START PAGE
============================================================ */

initializeAdminPage();



/* ============================================================
   07. INITIALIZE ADMIN PAGE
============================================================ */

function initializeAdminPage() {

    const isUnlocked =
        sessionStorage.getItem(
            ADMIN_SESSION_KEY
        )
        ===
        "true";


    if (
        isUnlocked
    ) {

        showAdminDashboard();

        loadAdminFirebaseData();

    }

    else {

        showAdminLogin();

    }

}



/* ============================================================
   08. ADMIN LOGIN
============================================================ */

adminLoginForm.addEventListener(

    "submit",

    (event) => {

        event.preventDefault();


        const enteredPassword =
            adminPasswordInput.value;


        if (
            enteredPassword ===
            ADMIN_PASSWORD
        ) {

            sessionStorage.setItem(
                ADMIN_SESSION_KEY,
                "true"
            );


            adminPasswordInput.value =
                "";


            adminLoginError.classList.add(
                "hidden"
            );


            showAdminDashboard();


            loadAdminFirebaseData();


            return;

        }


        adminLoginError.classList.remove(
            "hidden"
        );


        adminPasswordInput.select();

    }

);



/* ============================================================
   09. ADMIN LOGOUT / LOCK
============================================================ */

adminLogoutButton.addEventListener(

    "click",

    () => {

        sessionStorage.removeItem(
            ADMIN_SESSION_KEY
        );


        adminPasswordInput.value =
            "";


        adminLoginError.classList.add(
            "hidden"
        );


        showAdminLogin();

    }

);



/* ============================================================
   10. SHOW ADMIN DASHBOARD
============================================================ */

function showAdminDashboard() {

    adminLoginSection.classList.add(
        "hidden"
    );


    adminDashboard.classList.remove(
        "hidden"
    );

}



/* ============================================================
   11. SHOW ADMIN LOGIN
============================================================ */

function showAdminLogin() {

    adminDashboard.classList.add(
        "hidden"
    );


    adminLoginSection.classList.remove(
        "hidden"
    );


    setTimeout(

        () => {

            adminPasswordInput.focus();

        },

        0

    );

}

/* ============================================================
   12. FINALIZE MONTH VALIDATION

   Step 11D-1

   This step does NOT write anything to Firebase.

   It only checks whether the active month is
   safe to finalize.
============================================================ */

adminFinalizeMonthButton.addEventListener(

    "click",

    () => {

        validateMonthForFinalization();

    }

);



/* ============================================================
   13. VALIDATE MONTH FOR FINALIZATION
============================================================ */

function validateMonthForFinalization() {

    /*
       1. There must be an active month.
    */

    if (
        !activeMonthId
        ||
        !activeMonthData
    ) {

        window.alert(
            "There is no active month to finalize."
        );


        return;

    }


    /*
       2. The month must not already be finalized.
    */

    const monthStatus =
        getMonthStatus(
            activeMonthData
        );


    if (
    monthStatus ===
    "FINALIZED"
) {

    /*
       A finalized month normally cannot be finalized again.

       However, if its frozen snapshot is incomplete,
       Admin may safely rebuild that snapshot from the
       existing COMPLETED games.

       This does NOT change or delete any games.
    */

    const finalizedSnapshot =
        activeMonthData?.finalizedSnapshot;


    const snapshotIsComplete =
        isFinalizedSnapshotComplete(
            finalizedSnapshot
        );


    if (
        snapshotIsComplete
    ) {

        window.alert(
            "This month is already finalized and its snapshot is complete."
        );


        return;

    }


    const confirmedRepair =
        window.confirm(

            `${getMonthLabel(activeMonthData)} is already finalized, ` +

            `but its frozen snapshot is incomplete.\n\n` +

            `The snapshot will now be rebuilt from the existing completed games.\n\n` +

            `No games will be changed or deleted.\n\n` +

            `Continue with snapshot repair?`

        );


    if (
        !confirmedRepair
    ) {

        return;

    }


    finalizeCurrentMonth();


    return;

}


    /*
       3. Count ACTIVE games.
    */

    const activeGames =
        countGamesByStatus(
            activeMonthData,
            "ACTIVE"
        );


    if (
        activeGames > 0
    ) {

        window.alert(

            `This month cannot be finalized yet.\n\n` +

            `${activeGames} active game${activeGames === 1 ? "" : "s"} ` +

            `must be completed or cancelled first.`

        );


        return;

    }


    /*
       4. There must be at least one COMPLETED game.
    */

    const completedGames =
        countGamesByStatus(
            activeMonthData,
            "COMPLETED"
        );


    if (
        completedGames === 0
    ) {

        window.alert(
            "This month cannot be finalized because it has no completed games."
        );


        return;

    }


    /*
       5. All validation passed.

       We are still NOT finalizing the month in this step.
    */

    const confirmed =
    window.confirm(

        `${getMonthLabel(activeMonthData)} is ready to finalize.\n\n` +

        `Completed games: ${completedGames}\n` +

        `Active games: ${activeGames}\n\n` +

        `Finalizing will freeze the standings, categories and records.\n\n` +

        `Do you want to continue?`

    );


if (
    !confirmed
) {

    return;

}


finalizeCurrentMonth();

}

/* ============================================================
   FINALIZE CURRENT MONTH
============================================================ */

async function finalizeCurrentMonth() {

    if (
        !activeMonthId
        ||
        !activeMonthData
    ) {

        window.alert(
            "No active month is available."
        );

        return;

    }


    adminFinalizeMonthButton.disabled =
        true;


    adminFinalizeMonthButton.textContent =
        "Finalizing...";


    try {

        /*
           Build the frozen snapshot.
        */

        const snapshot =
            buildFinalizedSnapshot(
                activeMonthData
            );


        const finalizedAt =
            Date.now();


        snapshot.finalizedAt =
            finalizedAt;


        /*
           Firebase multi-location update.

           This saves the snapshot and changes
           the month status together.
        */

        const updates =
            {};


        updates[
            `months/${activeMonthId}/finalizedSnapshot`
        ] =
            snapshot;


        updates[
            `months/${activeMonthId}/info/status`
        ] =
            "FINALIZED";


        updates[
            `months/${activeMonthId}/info/finalizedAt`
        ] =
            finalizedAt;


        updates[
            `months/${activeMonthId}/status`
        ] =
            "FINALIZED";


        updates[
            `months/${activeMonthId}/finalizedAt`
        ] =
            finalizedAt;


        await update(

            ref(
                database
            ),

            updates

        );


        window.alert(

            `${getMonthLabel(activeMonthData)} has been finalized successfully.`

        );


        /*
           Reload Admin data so the screen immediately
           shows the finalized state.
        */

        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to finalize month:",
            error
        );


        window.alert(
            "Unable to finalize the month. Please check the console for details."
        );

    }

    finally {

        adminFinalizeMonthButton.disabled =
            false;


        adminFinalizeMonthButton.textContent =
            "Finalize Current Month";

    }

}

/* ============================================================
   START NEXT MONTH

   Step 11E-1

   Rules:
   - Current month must exist.
   - Current month must be FINALIZED.
   - Finalized snapshot must be complete.
   - Next month must not already exist.
   - Creates the next month.
   - Updates settings/activeMonth.
   - Does NOT change the finalized month.
============================================================ */

adminStartNextMonthButton.addEventListener(

    "click",

    () => {

        validateStartNextMonth();

    }

);



/* ============================================================
   VALIDATE START NEXT MONTH
============================================================ */

function validateStartNextMonth() {

    if (
        !activeMonthId
        ||
        !activeMonthData
    ) {

        window.alert(
            "There is no current month available."
        );


        return;

    }


    const currentStatus =
        getMonthStatus(
            activeMonthData
        );


    /*
       The current month must be finalized first.
    */

    if (
        currentStatus !==
        "FINALIZED"
    ) {

        window.alert(

            `${getMonthLabel(activeMonthData)} must be finalized before starting the next month.`

        );


        return;

    }


    /*
       Protect against starting the next month
       from an incomplete finalized snapshot.
    */

    if (
        !isFinalizedSnapshotComplete(
            activeMonthData.finalizedSnapshot
        )
    ) {

        window.alert(

            `${getMonthLabel(activeMonthData)} has an incomplete finalized snapshot.\n\n` +

            `Repair the finalized month before starting the next month.`

        );


        return;

    }


    const nextMonth =
        getNextMonthInfo(
            activeMonthId
        );


    if (
        !nextMonth
    ) {

        window.alert(
            "Unable to determine the next month."
        );


        return;

    }


    /*
       Do not accidentally overwrite an
       existing month.
    */

    const existingMonth =
        allMonths.find(

            (month) =>

                String(
                    month.id
                )
                ===
                String(
                    nextMonth.id
                )

        );


    if (
        existingMonth
    ) {

        window.alert(

            `${nextMonth.label} already exists.\n\n` +

            `No new month was created.`

        );


        return;

    }


    const confirmed =
        window.confirm(

            `Start ${nextMonth.label}?\n\n` +

            `${getMonthLabel(activeMonthData)} will remain finalized and unchanged.\n\n` +

            `${nextMonth.label} will become the new active month.`

        );


    if (
        !confirmed
    ) {

        return;

    }


    startNextMonth(
        nextMonth
    );

}



/* ============================================================
   CREATE NEXT MONTH
============================================================ */

async function startNextMonth(
    nextMonth
) {

    adminStartNextMonthButton.disabled =
        true;


    adminStartNextMonthButton.textContent =
        "Starting...";


    try {

        const createdAt =
            Date.now();


        /*
           New active month information.
        */

        const monthInfo = {

            label:
                nextMonth.label,

            year:
                nextMonth.year,

            month:
                nextMonth.month,

            status:
                "ACTIVE",

            createdAt:
                createdAt

        };


        /*
           settings/activeMonth keeps the same
           object structure already used by
           Start Game and Admin.
        */

        const activeMonthSetting = {

            id:
                nextMonth.id,

            label:
                nextMonth.label,

            year:
                nextMonth.year,

            month:
                nextMonth.month,

            status:
                "ACTIVE",

            createdAt:
                createdAt

        };


        const updates =
            {};


        updates[
            `months/${nextMonth.id}/info`
        ] =
            monthInfo;


        updates[
            `months/${nextMonth.id}/status`
        ] =
            "ACTIVE";


        updates[
            `months/${nextMonth.id}/lastGameNumber`
        ] =
            0;


        updates[
            "settings/activeMonth"
        ] =
            activeMonthSetting;


        await update(

            ref(
                database
            ),

            updates

        );


        window.alert(

            `${nextMonth.label} has been started successfully.\n\n` +

            `It is now the active month.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to start next month:",
            error
        );


        window.alert(
            "Unable to start the next month. Please check the console for details."
        );

    }

    finally {

        adminStartNextMonthButton.disabled =
            false;


        adminStartNextMonthButton.textContent =
            "Start Next Month";

    }

}



/* ============================================================
   GET NEXT MONTH INFORMATION

   Example:

   2026-09 -> 2026-10
   2026-12 -> 2027-01
============================================================ */

function getNextMonthInfo(
    currentMonthId
) {

    const parts =
        String(
            currentMonthId
            ||
            ""
        ).split(
            "-"
        );


    if (
        parts.length !==
        2
    ) {

        return null;

    }


    let year =
        Number(
            parts[0]
        );


    let month =
        Number(
            parts[1]
        );


    if (
        !Number.isInteger(
            year
        )
        ||
        !Number.isInteger(
            month
        )
        ||
        month < 1
        ||
        month > 12
    ) {

        return null;

    }


    month +=
        1;


    if (
        month > 12
    ) {

        month =
            1;


        year +=
            1;

    }


    const monthId =
        `${year}-${String(
            month
        ).padStart(
            2,
            "0"
        )}`;


    return {

        id:
            monthId,

        year:
            year,

        month:
            month,

        label:
            buildMonthLabel(
                monthId
            )

    };

}

/* ============================================================
   12. LOAD ADMIN FIREBASE DATA
============================================================ */

async function loadAdminFirebaseData() {

    resetAdminSummary();

closeCompletedGameEditor();

closeHistoricalCorrectionMonth();

    try {

        const [
    activeMonthSnapshot,
    monthsSnapshot,
    playersSnapshot
] =
await Promise.all([

    get(
        ref(
            database,
            "settings/activeMonth"
        )
    ),

    get(
        ref(
            database,
            "months"
        )
    ),

    get(
        ref(
            database,
            "players"
        )
    )

]);


        activeMonthId =
            getActiveMonthId(
                activeMonthSnapshot
            );


        allMonths =
            snapshotToMonths(
                monthsSnapshot
            );

            allPlayers =
    snapshotToPlayers(
        playersSnapshot
    );

        if (
            activeMonthId
        ) {

            activeMonthData =
                allMonths.find(

                    (month) =>

                        String(
                            month.id
                        )
                        ===
                        String(
                            activeMonthId
                        )

                )
                ||
                null;

        }

        else {

            activeMonthData =
                null;

        }


        renderActiveMonthSummary();


renderActiveGames();


renderCompletedGames();


renderPlayersManagement();


renderFinalizedMonths();


        console.log(
            "Admin Firebase data loaded:",
            {
                activeMonthId:
                    activeMonthId,

                months:
                    allMonths.length
            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load admin Firebase data:",
            error
        );


        adminActiveMonthLabel.textContent =
            "Unable to load";


        adminActiveMonthStatus.textContent =
            "ERROR";


        adminCompletedGamesCount.textContent =
            "—";


        adminActiveGamesCount.textContent =
            "—";


        adminFinalizedMonthsList.innerHTML =
            `
                <div class="admin-empty-state">
                    Unable to load finalized months.
                </div>
            `;

    }

}



/* ============================================================
   13. GET ACTIVE MONTH ID

   Supports:
   settings/activeMonth = "2026-09"

   and also:
   settings/activeMonth = {
       id: "2026-09"
   }
============================================================ */

function getActiveMonthId(
    snapshot
) {

    if (
        !snapshot.exists()
    ) {

        return null;

    }


    const value =
        snapshot.val();


    if (
        typeof value ===
        "string"
    ) {

        return value;

    }


    if (
        value
        &&
        typeof value ===
        "object"
    ) {

        return (

            value.id
            ||
            value.monthId
            ||
            null

        );

    }


    return null;

}



/* ============================================================
   14. SNAPSHOT TO MONTHS
============================================================ */

function snapshotToMonths(
    snapshot
) {

    const months =
        [];


    if (
        !snapshot.exists()
    ) {

        return months;

    }


    snapshot.forEach(

        (monthSnapshot) => {

            const monthData =
                monthSnapshot.val()
                ||
                {};


            months.push({

                id:
                    monthSnapshot.key,

                ...monthData

            });

        }

    );


    months.sort(

        (monthA, monthB) =>

            String(
                monthB.id
            ).localeCompare(
                String(
                    monthA.id
                )
            )

    );


    return months;

}

/* ============================================================
   SNAPSHOT TO PLAYERS

   Step 11G-1

   Converts Firebase /players into a normal array.

   No Firebase writes are performed here.
============================================================ */

function snapshotToPlayers(
    snapshot
) {

    const players =
        [];


    if (
        !snapshot.exists()
    ) {

        return players;

    }


    snapshot.forEach(

        (playerSnapshot) => {

            const playerData =
                playerSnapshot.val()
                ||
                {};


            players.push({

                id:
                    playerSnapshot.key,

                ...playerData

            });

        }

    );


    /*
       Active players first.

       Within each group, sort alphabetically.
    */

    players.sort(

        (playerA, playerB) => {

            const activeA =
                playerA.active !==
                false;


            const activeB =
                playerB.active !==
                false;


            if (
                activeA !==
                activeB
            ) {

                return activeA
                    ? -1
                    : 1;

            }


            return String(
                playerA.name
                ||
                ""
            ).localeCompare(

                String(
                    playerB.name
                    ||
                    ""
                )

            );

        }

    );


    return players;

}

/* ============================================================
   15. RENDER ACTIVE MONTH SUMMARY
============================================================ */

function renderActiveMonthSummary() {

    if (
        !activeMonthId
    ) {

        adminActiveMonthLabel.textContent =
            "No active month";


        adminActiveMonthStatus.textContent =
            "NONE";


        adminCompletedGamesCount.textContent =
            "0";


        adminActiveGamesCount.textContent =
            "0";


        return;

    }


    if (
        !activeMonthData
    ) {

        adminActiveMonthLabel.textContent =
            buildMonthLabel(
                activeMonthId
            );


        adminActiveMonthStatus.textContent =
            "NOT FOUND";


        adminCompletedGamesCount.textContent =
            "0";


        adminActiveGamesCount.textContent =
            "0";


        return;

    }


    const status =
        getMonthStatus(
            activeMonthData
        );


    const games =
        activeMonthData.games
        ||
        {};


    let completedGames =
        0;


    let activeGames =
        0;


    Object.values(
        games
    ).forEach(

        (game) => {

            if (
                !game
            ) {

                return;

            }


            const gameStatus =
                String(
                    game.status
                    ||
                    ""
                ).toUpperCase();


            if (
                gameStatus ===
                "COMPLETED"
            ) {

                completedGames +=
                    1;

            }


            if (
                gameStatus ===
                "ACTIVE"
            ) {

                activeGames +=
                    1;

            }

        }

    );


    adminActiveMonthLabel.textContent =
        getMonthLabel(
            activeMonthData
        );


    adminActiveMonthStatus.textContent =
        status;


    adminCompletedGamesCount.textContent =
        String(
            completedGames
        );


    adminActiveGamesCount.textContent =
        String(
            activeGames
        );

}

/* ============================================================
   RENDER ACTIVE GAMES

   Step 11F-1

   Shows ACTIVE games from the current active month.

   No Firebase writes are performed here.
============================================================ */

function renderActiveGames() {

    adminActiveGamesList.innerHTML =
        "";


    if (
        !activeMonthData
    ) {

        adminActiveGamesList.innerHTML =
            `
                <div class="admin-empty-state">
                    No active month available.
                </div>
            `;


        return;

    }


    const games =
        activeMonthData.games
        ||
        {};


    const activeGames =
        Object.entries(
            games
        )
        .map(

            ([gameId, game]) => ({

                id:
                    gameId,

                ...game

            })

        )
        .filter(

            (game) =>

                String(
                    game.status
                    ||
                    ""
                ).toUpperCase()
                ===
                "ACTIVE"

        )
        .sort(

            (gameA, gameB) =>

                Number(
                    gameB.gameNumber
                    ||
                    0
                )

                -

                Number(
                    gameA.gameNumber
                    ||
                    0
                )

        );


    if (
        activeGames.length ===
        0
    ) {

        adminActiveGamesList.innerHTML =
            `
                <div class="admin-empty-state">
                    No active games.
                </div>
            `;


        return;

    }


    activeGames.forEach(

        (game) => {

            adminActiveGamesList.appendChild(

                createAdminActiveGameCard(
                    game
                )

            );

        }

    );

}



/* ============================================================
   CREATE ADMIN ACTIVE GAME CARD
============================================================ */

function createAdminActiveGameCard(
    game
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-active-game-card";


    const players =
        getGamePlayers(
            game
        );


    const playerNames =
        players
        .map(

            (player) =>
                player.name

        )
        .join(
            " • "
        );


    const completedMatches =
        Number(
            game.completedMatches
            ||
            0
        );


    const totalMatches =
        Number(
            game.totalMatches
            ||
            10
        );


    card.innerHTML =
        `

            <div class="admin-active-game-top">

                <div>

                    <strong class="admin-active-game-number">

                        Game #${escapeHtml(
                            game.gameNumber
                            ||
                            "—"
                        )}

                    </strong>


                    <small>

                        ${completedMatches} of ${totalMatches} matches completed

                    </small>

                </div>


                <span class="admin-active-game-status">
                    ACTIVE
                </span>

            </div>


            <div class="admin-active-game-players">

                ${escapeHtml(
                    playerNames
                    ||
                    "Players unavailable"
                )}

            </div>


            <div class="admin-active-game-actions">

    <a
        class="admin-active-game-continue"
        href="live-game.html?month=${encodeURIComponent(
            activeMonthId
        )}&game=${encodeURIComponent(
            game.id
        )}"
    >
        Continue Game
    </a>


    <button
    type="button"
    class="admin-active-game-cancel"
    data-game-id="${escapeHtml(
        game.id
    )}"
>
    Cancel Game
</button>

</div>

            `;


const cancelButton =
    card.querySelector(
        ".admin-active-game-cancel"
    );


cancelButton.addEventListener(

    "click",

    () => {

        confirmCancelActiveGame(
            game
        );

    }

);


return card;

}

/* ============================================================
   CANCEL ACTIVE GAME

   Step 11F-2

   Cancellation rules:
   - Only ACTIVE games can be cancelled.
   - Game data and entered matches are preserved.
   - Game number is never reused.
   - CANCELLED games do not count toward statistics.
============================================================ */

function confirmCancelActiveGame(
    game
) {

    if (
        !activeMonthId
        ||
        !activeMonthData
        ||
        !game?.id
    ) {

        window.alert(
            "Unable to identify this game."
        );


        return;

    }


    const gameStatus =
        String(
            game.status
            ||
            ""
        ).toUpperCase();


    if (
        gameStatus !==
        "ACTIVE"
    ) {

        window.alert(
            "Only an active game can be cancelled."
        );


        return;

    }


    const players =
        getGamePlayers(
            game
        );


    const playerNames =
        players
        .map(

            (player) =>
                player.name

        )
        .join(
            ", "
        );


    const completedMatches =
        Number(
            game.completedMatches
            ||
            0
        );


    const confirmed =
        window.confirm(

            `Cancel Game #${game.gameNumber || "—"}?\n\n` +

            `Players: ${playerNames || "Unavailable"}\n` +

            `Matches completed: ${completedMatches} of ${game.totalMatches || 10}\n\n` +

            `The game will NOT be deleted.\n` +

            `Any scores already entered will remain stored.\n` +

            `The game will be marked CANCELLED and excluded from league statistics.\n\n` +

            `This game number will not be reused.\n\n` +

            `Continue?`

        );


    if (
        !confirmed
    ) {

        return;

    }


    cancelActiveGame(
        game
    );

}



/* ============================================================
   WRITE CANCELLED GAME STATUS
============================================================ */

async function cancelActiveGame(
    game
) {

    const cancelButton =
    document.querySelector(
        `.admin-active-game-cancel[data-game-id="${CSS.escape(
            String(
                game.id
            )
        )}"]`
    );


    if (
        cancelButton
    ) {

        cancelButton.disabled =
            true;

    }


    try {

        /*
           Re-read the game before writing.

           This prevents Admin from cancelling a game
           that somebody completed in another browser
           after this Admin page was loaded.
        */

        const gameSnapshot =
            await get(

                ref(
                    database,
                    `months/${activeMonthId}/games/${game.id}`
                )

            );


        if (
            !gameSnapshot.exists()
        ) {

            window.alert(
                "This game no longer exists."
            );


            await loadAdminFirebaseData();


            return;

        }


        const currentGame =
            gameSnapshot.val()
            ||
            {};


        const currentStatus =
            String(
                currentGame.status
                ||
                ""
            ).toUpperCase();


        if (
            currentStatus !==
            "ACTIVE"
        ) {

            window.alert(

                `Game #${currentGame.gameNumber || game.gameNumber || "—"} is no longer active.\n\n` +

                `Current status: ${currentStatus || "UNKNOWN"}`

            );


            await loadAdminFirebaseData();


            return;

        }


        const cancelledAt =
            Date.now();


        const updates =
            {};


        updates[
            `months/${activeMonthId}/games/${game.id}/status`
        ] =
            "CANCELLED";


        updates[
            `months/${activeMonthId}/games/${game.id}/cancelledAt`
        ] =
            cancelledAt;


        updates[
            `months/${activeMonthId}/games/${game.id}/updatedAt`
        ] =
            cancelledAt;


        await update(

            ref(
                database
            ),

            updates

        );


        /*
           Remove this game from the browser's
           remembered current-game value if it
           happens to be pointing to this game.

           Firebase remains the actual source of truth.
        */

        const storedCurrentGame =
            localStorage.getItem(
                "familyCardCurrentGame"
            );


        if (
            storedCurrentGame
        ) {

            try {

                const parsedCurrentGame =
                    JSON.parse(
                        storedCurrentGame
                    );


                const storedGameId =
                    parsedCurrentGame?.gameId
                    ||
                    parsedCurrentGame?.id
                    ||
                    null;


                const storedMonthId =
                    parsedCurrentGame?.monthId
                    ||
                    parsedCurrentGame?.month
                    ||
                    null;


                if (
                    String(
                        storedGameId
                    )
                    ===
                    String(
                        game.id
                    )
                    &&
                    String(
                        storedMonthId
                    )
                    ===
                    String(
                        activeMonthId
                    )
                ) {

                    localStorage.removeItem(
                        "familyCardCurrentGame"
                    );

                }

            }

            catch (error) {

                /*
                   Ignore invalid old localStorage data.
                   Firebase cancellation has already succeeded.
                */

                console.warn(
                    "Unable to read stored current game:",
                    error
                );

            }

        }


        window.alert(

            `Game #${currentGame.gameNumber || game.gameNumber || "—"} has been cancelled.\n\n` +

            `The game remains in history but will not count toward standings or records.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to cancel game:",
            error
        );


        window.alert(
            "Unable to cancel the game. Please check the console for details."
        );

    }

}

/* ============================================================
   RENDER COMPLETED GAMES

   Step 11F-3

   Shows COMPLETED games from the current month.

   This step is read-only.
   No game editing or cancellation yet.
============================================================ */

function renderCompletedGames() {

    adminCompletedGamesList.innerHTML =
        "";


    if (
        !activeMonthData
    ) {

        adminCompletedGamesList.innerHTML =
            `
                <div class="admin-empty-state">
                    No active month available.
                </div>
            `;


        return;

    }


    const games =
        activeMonthData.games
        ||
        {};


    const completedGames =
        Object.entries(
            games
        )
        .map(

            ([gameId, game]) => ({

                id:
                    gameId,

                ...game

            })

        )
        .filter(

            (game) =>

                String(
                    game.status
                    ||
                    ""
                ).toUpperCase()
                ===
                "COMPLETED"

        )
        .sort(

            (gameA, gameB) =>

                Number(
                    gameB.gameNumber
                    ||
                    0
                )

                -

                Number(
                    gameA.gameNumber
                    ||
                    0
                )

        );


    if (
        completedGames.length ===
        0
    ) {

        adminCompletedGamesList.innerHTML =
            `
                <div class="admin-empty-state">
                    No completed games.
                </div>
            `;


        return;

    }


    completedGames.forEach(

        (game) => {

            adminCompletedGamesList.appendChild(

                createAdminCompletedGameCard(
                    game
                )

            );

        }

    );

}



/* ============================================================
   CREATE ADMIN COMPLETED GAME CARD
============================================================ */

function createAdminCompletedGameCard(
    game
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-completed-game-card";


    const players =
        getGamePlayers(
            game
        );


    const totals =
        getGameTotals(
            game
        );


    const winnerIds =
        getWinnerIds(
            game
        );


    const playerRows =
        players
        .map(

            (player) => {

                const isWinner =
                    winnerIds.includes(
                        player.id
                    );


                return `
                    <div class="admin-completed-player-row">

                        <span>
                            ${isWinner ? "★ " : ""}${escapeHtml(
                                player.name
                            )}
                        </span>

                        <strong>
                            ${escapeHtml(
                                totals[
                                    player.id
                                ]
                                ??
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


    const winnerNames =
        players
        .filter(

            (player) =>

                winnerIds.includes(
                    player.id
                )

        )
        .map(

            (player) =>
                player.name

        )
        .join(
            ", "
        );


    card.innerHTML =
        `

            <div class="admin-completed-game-top">

                <div>

                    <strong class="admin-completed-game-number">
                        Game #${escapeHtml(
                            game.gameNumber
                            ||
                            "—"
                        )}
                    </strong>

                    <small>
                        ${formatAdminGameDate(
                            game.completedAt
                            ||
                            game.createdAt
                        )}
                    </small>

                </div>


                <span class="admin-completed-game-status">
                    COMPLETED
                </span>

            </div>


            <div class="admin-completed-winner">

                <span>
                    Winner${winnerIds.length === 1 ? "" : "s"}
                </span>

                <strong>
                    ${escapeHtml(
                        winnerNames
                        ||
                        "Unavailable"
                    )}
                </strong>

            </div>


            <div class="admin-completed-player-list">

                ${playerRows}

            </div>


            <div class="admin-completed-game-actions">

    <a
        class="admin-completed-game-view"
        href="game-details.html?month=${encodeURIComponent(
            activeMonthId
        )}&game=${encodeURIComponent(
            game.id
        )}"
    >
        View Game Details
    </a>


    <button
        type="button"
        class="admin-completed-game-edit"
        data-game-id="${escapeHtml(
            game.id
        )}"
    >
        Edit Scores
    </button>


    <button
        type="button"
        class="admin-completed-game-cancel"
        data-game-id="${escapeHtml(
            game.id
        )}"
    >
        Cancel Completed Game
    </button>

</div>

            `;

            const editScoresButton =
    card.querySelector(
        ".admin-completed-game-edit"
    );


editScoresButton.addEventListener(

    "click",

    () => {

        openCompletedGameEditor(

            game,
            activeMonthId,
            activeMonthData

        );

    }

);

const cancelCompletedButton =
    card.querySelector(
        ".admin-completed-game-cancel"
    );


cancelCompletedButton.addEventListener(

    "click",

    () => {

        confirmCancelCompletedGame(
            game
        );

    }

);


return card;

}

/* ============================================================
   CANCEL COMPLETED GAME

   Step 11F-4

   Rules:
   - Only COMPLETED games may use this action.
   - Current month must still be ACTIVE.
   - Finalized months cannot be changed here.
   - Game data, scores, totals and winners remain stored.
   - Status changes to CANCELLED.
   - CANCELLED games stop counting in league statistics.
============================================================ */

function confirmCancelCompletedGame(
    game
) {

    if (
        !activeMonthId
        ||
        !activeMonthData
        ||
        !game?.id
    ) {

        window.alert(
            "Unable to identify this game."
        );


        return;

    }


    /*
       Never allow a finalized month to be changed
       without the proper reopen workflow.
    */

    const monthStatus =
        getMonthStatus(
            activeMonthData
        );


    if (
        monthStatus !==
        "ACTIVE"
    ) {

        window.alert(

            `${getMonthLabel(activeMonthData)} is not an active month.\n\n` +

            `Finalized months must be reopened before games can be corrected.`

        );


        return;

    }


    const gameStatus =
        String(
            game.status
            ||
            ""
        ).toUpperCase();


    if (
        gameStatus !==
        "COMPLETED"
    ) {

        window.alert(
            "Only a completed game can use this correction."
        );


        return;

    }


    const players =
        getGamePlayers(
            game
        );


    const playerNames =
        players
        .map(

            (player) =>
                player.name

        )
        .join(
            ", "
        );


    const confirmed =
        window.confirm(

            `Cancel completed Game #${game.gameNumber || "—"}?\n\n` +

            `Players: ${playerNames || "Unavailable"}\n\n` +

            `IMPORTANT:\n` +

            `This game will stop counting toward standings, points, wins, categories and records.\n\n` +

            `The game will NOT be deleted.\n` +

            `Its 10 match scores, totals and other data will remain stored for history.\n\n` +

            `Continue?`

        );


    if (
        !confirmed
    ) {

        return;

    }


    cancelCompletedGame(
        game
    );

}



/* ============================================================
   WRITE COMPLETED GAME AS CANCELLED
============================================================ */

async function cancelCompletedGame(
    game
) {

    const cancelButton =
        document.querySelector(

            `.admin-completed-game-cancel[data-game-id="${CSS.escape(
                String(
                    game.id
                )
            )}"]`

        );


    if (
        cancelButton
    ) {

        cancelButton.disabled =
            true;


        cancelButton.textContent =
            "Cancelling...";

    }


    try {

        /*
           Re-read BOTH the month and game before changing it.

           This prevents an old Admin screen from modifying
           a month that was finalized in another browser.
        */

        const [
            monthInfoSnapshot,
            gameSnapshot
        ] =
        await Promise.all([

            get(

                ref(
                    database,
                    `months/${activeMonthId}/info`
                )

            ),

            get(

                ref(
                    database,
                    `months/${activeMonthId}/games/${game.id}`
                )

            )

        ]);


        /*
           Confirm month is still ACTIVE.
        */

        if (
            !monthInfoSnapshot.exists()
        ) {

            window.alert(
                "Unable to verify the month status."
            );


            await loadAdminFirebaseData();


            return;

        }


        const currentMonthInfo =
            monthInfoSnapshot.val()
            ||
            {};


        const currentMonthStatus =
            String(
                currentMonthInfo.status
                ||
                ""
            ).toUpperCase();


        if (
            currentMonthStatus !==
            "ACTIVE"
        ) {

            window.alert(

                `${currentMonthInfo.label || getMonthLabel(activeMonthData)} is no longer active.\n\n` +

                `The game was not changed.`

            );


            await loadAdminFirebaseData();


            return;

        }


        /*
           Confirm game still exists.
        */

        if (
            !gameSnapshot.exists()
        ) {

            window.alert(
                "This game no longer exists."
            );


            await loadAdminFirebaseData();


            return;

        }


        const currentGame =
            gameSnapshot.val()
            ||
            {};


        const currentGameStatus =
            String(
                currentGame.status
                ||
                ""
            ).toUpperCase();


        /*
           It must still be COMPLETED at the moment
           we make the Firebase write.
        */

        if (
            currentGameStatus !==
            "COMPLETED"
        ) {

            window.alert(

                `Game #${currentGame.gameNumber || game.gameNumber || "—"} is no longer completed.\n\n` +

                `Current status: ${currentGameStatus || "UNKNOWN"}\n\n` +

                `No changes were made.`

            );


            await loadAdminFirebaseData();


            return;

        }


        const cancelledAt =
            Date.now();


        const updates =
            {};


        updates[
            `months/${activeMonthId}/games/${game.id}/status`
        ] =
            "CANCELLED";


        updates[
            `months/${activeMonthId}/games/${game.id}/cancelledAt`
        ] =
            cancelledAt;


        updates[
            `months/${activeMonthId}/games/${game.id}/updatedAt`
        ] =
            cancelledAt;


        await update(

            ref(
                database
            ),

            updates

        );


        window.alert(

            `Game #${currentGame.gameNumber || game.gameNumber || "—"} has been cancelled.\n\n` +

            `The game is still stored in history but no longer counts in league statistics.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to cancel completed game:",
            error
        );


        window.alert(
            "Unable to cancel the completed game. Please check the console for details."
        );

    }

}

/* ============================================================
   COMPLETED GAME SCORE EDITOR

   Step 11F-5A

   Read-only workflow for now:
   - Loads a COMPLETED game
   - Displays all players
   - Displays all 10 matches
   - Places existing scores inside number inputs
   - Does NOT save anything to Firebase yet
============================================================ */

function openCompletedGameEditor(
    game,
    targetMonthId,
    targetMonthData
) {

    if (
        !game?.id
        ||
        !targetMonthId
        ||
        !targetMonthData
    ) {

        window.alert(
            "Unable to identify this game or month."
        );


        return;

    }


    const monthStatus =
        getMonthStatus(
            targetMonthData
        );


    /*
       Current league month:
       ACTIVE is allowed.

       Historical correction month:
       REOPENED is allowed.
    */

    if (
        monthStatus !==
        "ACTIVE"
        &&
        monthStatus !==
        "REOPENED"
    ) {

        window.alert(
            "This month is not open for corrections."
        );


        return;

    }


    if (
        String(
            game.status
            ||
            ""
        ).toUpperCase()
        !==
        "COMPLETED"
    ) {

        window.alert(
            "Only completed games can be edited."
        );


        return;

    }


    editingGameId =
        game.id;


    editingGameData =
        game;


    editingGameMonthId =
        targetMonthId;


    editingGameMonthData =
        targetMonthData;


    renderCompletedGameEditor(
        game
    );


    adminGameEditorSection.classList.remove(
        "hidden"
    );


    adminGameEditorSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}

/* ============================================================
   RENDER COMPLETED GAME EDITOR
============================================================ */

function renderCompletedGameEditor(
    game
) {

    const players =
        getGamePlayers(
            game
        );


    const matches =
        getGameMatches(
            game
        );


    adminGameEditorTitle.textContent =
        `Edit Game #${game.gameNumber || "—"} Scores`;


    adminGameEditorSubtitle.textContent =
    `${getMonthLabel(editingGameMonthData)} • ${players.length} players • ${matches.length} recorded matches`;


    /*
       Player legend.
    */

    adminGameEditorPlayers.innerHTML =
        players
        .map(

            (player, index) => `

                <div class="admin-game-editor-player">

                    <span class="admin-game-editor-seat">
                        ${index + 1}
                    </span>

                    <strong>
                        ${escapeHtml(
                            player.name
                        )}
                    </strong>

                </div>

            `

        )
        .join(
            ""
        );


    /*
       Match editor.
    */

    adminGameEditorMatches.innerHTML =
        "";


    /*
       A completed league game should contain
       exactly 10 matches.

       We render match numbers 1–10 even if a
       malformed game happens to have one missing.
    */

    for (
        let matchNumber = 1;
        matchNumber <= 10;
        matchNumber += 1
    ) {

        const storedMatch =
            matches.find(

                (match) =>

                    Number(
                        match.matchNumber
                    )
                    ===
                    matchNumber

            )
            ||
            null;


        const matchCard =
            document.createElement(
                "div"
            );


        matchCard.className =
            "admin-game-editor-match";


        const scoreInputs =
            players
            .map(

                (player) => {

                    const score =
                        storedMatch
                            ? getMatchScore(
                                storedMatch,
                                player.id
                            )
                            : null;


                    return `

                        <label class="admin-game-editor-score">

                            <span>
                                ${escapeHtml(
                                    player.name
                                )}
                            </span>


                            <input
                                type="number"
                                step="1"
                                inputmode="numeric"
                                class="admin-game-editor-score-input"
                                data-match-number="${matchNumber}"
                                data-player-id="${escapeHtml(
                                    player.id
                                )}"
                                value="${score === null ? "" : escapeHtml(score)}"
                            >

                        </label>

                    `;

                }

            )
            .join(
                ""
            );


        matchCard.innerHTML =
            `

                <div class="admin-game-editor-match-title">
                    Match ${matchNumber}
                </div>


                <div class="admin-game-editor-score-grid">

                    ${scoreInputs}

                </div>

            `;


        adminGameEditorMatches.appendChild(
            matchCard
        );

    }

}

/* ============================================================
   SAVE COMPLETED GAME SCORE CORRECTION

   Step 11F-5B
============================================================ */

adminGameEditorSaveButton.addEventListener(

    "click",

    () => {

        validateAndSaveGameCorrection();

    }

);



/* ============================================================
   VALIDATE SCORE CORRECTION
============================================================ */

async function validateAndSaveGameCorrection() {

    if (
    !editingGameId
    ||
    !editingGameData
    ||
    !editingGameMonthId
    ||
    !editingGameMonthData
) {

        window.alert(
            "No completed game is currently open for editing."
        );


        return;

    }


    /*
       The currently loaded month must still appear ACTIVE.
    */

    const editorMonthStatus =
    getMonthStatus(
        editingGameMonthData
    );


if (
    editorMonthStatus !==
    "ACTIVE"
    &&
    editorMonthStatus !==
    "REOPENED"
) {

    window.alert(
        "This month is no longer open for corrections."
    );


    return;

}


    const players =
        getGamePlayers(
            editingGameData
        );


    if (
        players.length !==
        4
    ) {

        window.alert(

            `This game has ${players.length} players.\n\n` +

            `A valid completed game must contain exactly 4 players.`

        );


        return;

    }


    const scoreInputs =
        Array.from(

            adminGameEditorMatches.querySelectorAll(
                ".admin-game-editor-score-input"
            )

        );


    /*
       10 matches × 4 players = 40 score inputs.
    */

    if (
        scoreInputs.length !==
        40
    ) {

        window.alert(

            `Expected 40 score fields but found ${scoreInputs.length}.\n\n` +

            `No changes were saved.`

        );


        return;

    }


    const correctedScores =
        {};


    /*
       Read and validate every input.
    */

    for (
        const input
        of scoreInputs
    ) {

        const matchNumber =
            Number(
                input.dataset.matchNumber
            );


        const playerId =
            String(
                input.dataset.playerId
                ||
                ""
            );


        const rawValue =
            String(
                input.value
                ??
                ""
            ).trim();


        /*
           Blank score is not allowed.
        */

        if (
            rawValue ===
            ""
    ) {

            window.alert(

                `A score is missing in Match ${matchNumber}.\n\n` +

                `Every player must have a score in all 10 matches.`

            );


            input.focus();


            return;

        }


        const numericValue =
            Number(
                rawValue
            );


        /*
           Scores must be integers.

           Positive, zero and negative are valid.
           Decimal values are not allowed.
        */

        if (
            !Number.isFinite(
                numericValue
            )
            ||
            !Number.isInteger(
                numericValue
            )
        ) {

            window.alert(

                `Invalid score in Match ${matchNumber}.\n\n` +

                `"${rawValue}" is not a valid whole number.\n\n` +

                `Use integers only. Positive, zero and negative values are allowed.`

            );


            input.focus();

            input.select();


            return;

        }


        if (
            !Number.isInteger(
                matchNumber
            )
            ||
            matchNumber < 1
            ||
            matchNumber > 10
            ||
            !playerId
        ) {

            window.alert(
                "One of the score fields contains invalid game information."
            );


            return;

        }


        if (
            !correctedScores[
                matchNumber
            ]
        ) {

            correctedScores[
                matchNumber
            ] =
                {};

        }


        correctedScores[
            matchNumber
        ][
            playerId
        ] =
            numericValue;

    }


    /*
       Verify every match has every player.
    */

    for (
        let matchNumber = 1;
        matchNumber <= 10;
        matchNumber += 1
    ) {

        const matchScores =
            correctedScores[
                matchNumber
            ]
            ||
            {};


        for (
            const player
            of players
        ) {

            if (
                matchScores[
                    player.id
                ]
                ===
                undefined
        ) {

                window.alert(

                    `Match ${matchNumber} is missing a score for ${player.name}.\n\n` +

                    `No changes were saved.`

                );


                return;

            }

        }

    }


    /*
       Calculate new totals before showing confirmation.
    */

    const calculation =
        calculateCorrectedGameResult(

            players,
            correctedScores

        );


    const resultLines =
        players
        .map(

            (player) => {

                const total =
                    calculation.finalTotals[
                        player.id
                    ];


                const winnerMark =
                    calculation.winnerIds.includes(
                        player.id
                    )
                        ? " ★"
                        : "";


                return (
                    `${player.name}: ${total}${winnerMark}`
                );

            }

        )
        .join(
            "\n"
        );


    const confirmed =
        window.confirm(

            `Save corrected scores for Game #${editingGameData.gameNumber || "—"}?\n\n` +

            `${resultLines}\n\n` +

            `Winning total: ${calculation.winningTotal}\n\n` +

            `This will replace the saved match scores and recalculate the game totals and winner information.\n\n` +

            `The game will remain COMPLETED.\n\n` +

            `Continue?`

        );


    if (
        !confirmed
    ) {

        return;

    }


    await saveCompletedGameCorrection(

        correctedScores,
        calculation

    );

}

/* ============================================================
   CALCULATE CORRECTED GAME RESULT
============================================================ */

function calculateCorrectedGameResult(
    players,
    correctedScores
) {

    const finalTotals =
        {};


    players.forEach(

        (player) => {

            finalTotals[
                player.id
            ] =
                0;

        }

    );


    /*
       Add all 10 match scores.
    */

    for (
        let matchNumber = 1;
        matchNumber <= 10;
        matchNumber += 1
    ) {

        const matchScores =
            correctedScores[
                matchNumber
            ]
            ||
            {};


        players.forEach(

            (player) => {

                finalTotals[
                    player.id
                ] +=
                    Number(
                        matchScores[
                            player.id
                        ]
                    );

            }

        );

    }


    /*
       Find highest complete-game total.
    */

    const totals =
        Object.values(
            finalTotals
        );


    const winningTotal =
        Math.max(
            ...totals
        );


    /*
       All players tied at the highest total
       are winners.
    */

    const winnerIds =
        players
        .filter(

            (player) =>

                finalTotals[
                    player.id
                ]
                ===
                winningTotal

        )
        .map(

            (player) =>
                player.id

        );


    return {

        finalTotals:
            finalTotals,

        winningTotal:
            winningTotal,

        winnerIds:
            winnerIds

    };

}

/* ============================================================
   SAVE COMPLETED GAME CORRECTION TO FIREBASE
============================================================ */

async function saveCompletedGameCorrection(
    correctedScores,
    calculation
) {

    adminGameEditorSaveButton.disabled =
        true;


    adminGameEditorCloseButton.disabled =
        true;


    adminGameEditorSaveButton.textContent =
        "Saving...";


    try {

        /*
           Re-read the month and exact game immediately
           before writing.

           This protects against another browser changing
           the month or game while the editor was open.
        */

        const [
            monthInfoSnapshot,
            gameSnapshot
        ] =
        await Promise.all([

            get(

                ref(
                    database,
                    `months/${editingGameMonthId}/info`
                )

            ),

            get(

                ref(
                    database,
                    `months/${editingGameMonthId}/games/${editingGameId}`
                )

            )

        ]);


        /*
           Confirm the month still exists.
        */

        if (
            !monthInfoSnapshot.exists()
        ) {

            window.alert(
                "Unable to verify the month before saving."
            );


            return;

        }


        const currentMonthInfo =
            monthInfoSnapshot.val()
            ||
            {};


        const currentMonthStatus =
            String(
                currentMonthInfo.status
                ||
                ""
            ).toUpperCase();


        /*
           Historical finalized months must not be
           modified through this editor.
        */

        if (
    currentMonthStatus !==
    "ACTIVE"
    &&
    currentMonthStatus !==
    "REOPENED"
) {

            window.alert(

                `${currentMonthInfo.label || getMonthLabel(editingGameMonthData)} is no longer open for corrections.\n\n` +

                `The correction was NOT saved.`

            );


            return;

        }


        /*
           Confirm the game still exists.
        */

        if (
            !gameSnapshot.exists()
        ) {

            window.alert(
                "This game no longer exists."
            );


            return;

        }


        const currentGame =
            gameSnapshot.val()
            ||
            {};


        const currentGameStatus =
            String(
                currentGame.status
                ||
                ""
            ).toUpperCase();


        /*
           Only COMPLETED games may be corrected.
        */

        if (
            currentGameStatus !==
            "COMPLETED"
        ) {

            window.alert(

                `Game #${currentGame.gameNumber || editingGameData?.gameNumber || "—"} is no longer completed.\n\n` +

                `Current status: ${currentGameStatus || "UNKNOWN"}\n\n` +

                `The correction was NOT saved.`

            );


            return;

        }


        const currentPlayers =
            getGamePlayers(
                currentGame
            );


        if (
            currentPlayers.length !==
            4
        ) {

            window.alert(
                "The saved game no longer contains exactly 4 players."
            );


            return;

        }


        /*
           Build the winner object in the same format
           already used by your completed games:

           winners: {
               playerId: {
                   name: "...",
                   total: 123
               }
           }
        */

        const winners =
            {};


        calculation.winnerIds.forEach(

            (winnerId) => {

                const winnerPlayer =
                    currentPlayers.find(

                        (player) =>

                            String(
                                player.id
                            )
                            ===
                            String(
                                winnerId
                            )

                    );


                if (
                    !winnerPlayer
                ) {

                    return;

                }


                winners[
                    winnerId
                ] =
                    {

                        name:
                            winnerPlayer.name,

                        total:
                            calculation.finalTotals[
                                winnerId
                            ]

                    };

            }

        );


        if (
            Object.keys(
                winners
            ).length ===
            0
        ) {

            window.alert(
                "Unable to calculate a valid winner. No changes were saved."
            );


            return;

        }


        const correctedAt =
            Date.now();


        const updates =
            {};


        /*
           Save all 40 corrected individual scores.

           We update only the scores, so the original
           matchNumber and createdAt values stay intact.
        */

        for (
            let matchNumber = 1;
            matchNumber <= 10;
            matchNumber += 1
        ) {

            currentPlayers.forEach(

                (player) => {

                    updates[
    `months/${editingGameMonthId}/games/${editingGameId}/matches/${matchNumber}/scores/${player.id}`
] =
                        correctedScores[
                            matchNumber
                        ][
                            player.id
                        ];

                }

            );

        }


        /*
           Replace calculated completion results.
        */

        updates[
            `months/${editingGameMonthId}/games/${editingGameId}/finalTotals`
        ] =
            calculation.finalTotals;


        updates[
            `months/${editingGameMonthId}/games/${editingGameId}/winners`
        ] =
            winners;


        updates[
            `months/${editingGameMonthId}/games/${editingGameId}/winningTotal`
        ] =
            calculation.winningTotal;


        /*
           Keep status COMPLETED.

           completedAt is intentionally NOT changed.
        */

        updates[
    `months/${editingGameMonthId}/games/${editingGameId}/status`
] =
    "COMPLETED";


        updates[
            `months/${editingGameMonthId}/games/${editingGameId}/updatedAt`
        ] =
            correctedAt;

        await update(

            ref(
                database
            ),

            updates

        );


        window.alert(

            `Game #${currentGame.gameNumber || editingGameData?.gameNumber || "—"} has been corrected successfully.\n\n` +

            `Scores, totals and winner information were recalculated.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to save game correction:",
            error
        );


        window.alert(
            "Unable to save the correction. Please check the console for details."
        );

    }

    finally {

        adminGameEditorSaveButton.disabled =
            false;


        adminGameEditorCloseButton.disabled =
            false;


        adminGameEditorSaveButton.textContent =
            "Save Correction";

    }

}

/* ============================================================
   CLOSE COMPLETED GAME EDITOR
============================================================ */

adminGameEditorCloseButton.addEventListener(

    "click",

    () => {

        closeCompletedGameEditor();

    }

);



function closeCompletedGameEditor() {

    editingGameId =
        null;


    editingGameData =
        null;

        editingGameMonthId =
    null;


editingGameMonthData =
    null;

    adminGameEditorPlayers.innerHTML =
        "";


    adminGameEditorMatches.innerHTML =
        "";


    adminGameEditorSection.classList.add(
        "hidden"
    );

}

/* ============================================================
   FORMAT ADMIN GAME DATE
============================================================ */

function formatAdminGameDate(
    timestamp
) {

    const numericTimestamp =
        Number(
            timestamp
            ||
            0
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
   16. RENDER FINALIZED MONTHS
============================================================ */

function renderFinalizedMonths() {

    adminFinalizedMonthsList.innerHTML =
        "";


    /*
       Historical month list.

       Show both:
       - FINALIZED months
       - REOPENED months

       The current ACTIVE month is not shown here.
    */

    const historicalMonths =
        allMonths
        .filter(

            (month) => {

                const status =
                    getMonthStatus(
                        month
                    );


                return (

                    status ===
                    "FINALIZED"

                    ||

                    status ===
                    "REOPENED"

                );

            }

        )
        .sort(

            (monthA, monthB) =>

                String(
                    monthB.id
                ).localeCompare(
                    String(
                        monthA.id
                    )
                )

        );


    if (
        historicalMonths.length ===
        0
    ) {

        adminFinalizedMonthsList.innerHTML =
            `
                <div class="admin-empty-state">
                    No historical months yet.
                </div>
            `;


        return;

    }


    historicalMonths.forEach(

        (month) => {

            const row =
                createFinalizedMonthRow(
                    month
                );


            adminFinalizedMonthsList.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   17. CREATE FINALIZED MONTH ROW
============================================================ */

function createFinalizedMonthRow(
    month
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "admin-historical-month";


    const status =
        getMonthStatus(
            month
        );


    const gameCount =
        countGamesByStatus(
            month,
            "COMPLETED"
        );


    const isFinalized =
        status ===
        "FINALIZED";


    const actionHtml =
    isFinalized

        ? `
            <button
                type="button"
                class="admin-historical-reopen-button"
                data-month-id="${escapeHtml(
                    month.id
                )}"
            >
                Reopen Month
            </button>
        `

        : `
            <div class="admin-historical-reopened-note">
                Correction mode is open
            </div>

            <button
                type="button"
                class="admin-historical-manage-button"
                data-month-id="${escapeHtml(
                    month.id
                )}"
            >
                Manage Corrections
            </button>
        `;


    row.innerHTML =
        `

            <div class="admin-historical-month-top">

                <div class="admin-historical-month-info">

                    <strong>
                        ${escapeHtml(
                            getMonthLabel(
                                month
                            )
                        )}
                    </strong>


                    <small>

                        ${gameCount}
                        completed game${gameCount === 1 ? "" : "s"}

                    </small>

                </div>


                <span
                    class="admin-historical-status
                    ${status === "REOPENED"
                        ? "admin-historical-status-reopened"
                        : ""
                    }"
                >
                    ${escapeHtml(
                        status
                    )}
                </span>

            </div>


            <div class="admin-historical-month-actions">

                ${actionHtml}

            </div>

        `;


    if (
        isFinalized
    ) {

        const reopenButton =
            row.querySelector(
                ".admin-historical-reopen-button"
            );


        reopenButton.addEventListener(

            "click",

            () => {

                confirmReopenHistoricalMonth(
                    month
                );

            }

        );

    }

    if (
    status ===
    "REOPENED"
) {

    const manageButton =
        row.querySelector(
            ".admin-historical-manage-button"
        );


    manageButton.addEventListener(

        "click",

        () => {

            openHistoricalCorrectionMonth(
                month
            );

        }

    );

}

    return row;

}

/* ============================================================
   REOPEN HISTORICAL MONTH

   Step 11F-6A

   Important:
   - Does NOT change settings/activeMonth.
   - Does NOT make this the league's active month.
   - Does NOT allow new games.
   - Only opens the historical month for corrections.
============================================================ */

function confirmReopenHistoricalMonth(
    month
) {

    if (
        !month?.id
    ) {

        window.alert(
            "Unable to identify this month."
        );


        return;

    }


    const status =
        getMonthStatus(
            month
        );


    if (
        status !==
        "FINALIZED"
    ) {

        window.alert(
            "Only a finalized month can be reopened."
        );


        return;

    }


    if (
        !isFinalizedSnapshotComplete(
            month.finalizedSnapshot
        )
    ) {

        window.alert(

            `${getMonthLabel(month)} does not have a complete finalized snapshot.\n\n` +

            `Repair the finalized snapshot before reopening the month.`

        );


        return;

    }


    const confirmed =
        window.confirm(

            `Reopen ${getMonthLabel(month)} for corrections?\n\n` +

            `This will NOT make it the active league month.\n\n` +

            `${getMonthLabel(activeMonthData)} will remain the current active month.\n\n` +

            `No new games can be created in the reopened month.\n\n` +

            `Existing games may be corrected later from Admin.\n\n` +

            `Continue?`

        );


    if (
        !confirmed
    ) {

        return;

    }


    reopenHistoricalMonth(
        month
    );

}



/* ============================================================
   WRITE REOPENED MONTH STATUS
============================================================ */

async function reopenHistoricalMonth(
    month
) {

    const reopenButton =
        document.querySelector(

            `.admin-historical-reopen-button[data-month-id="${CSS.escape(
                String(
                    month.id
                )
            )}"]`

        );


    if (
        reopenButton
    ) {

        reopenButton.disabled =
            true;


        reopenButton.textContent =
            "Reopening...";

    }


    try {

        /*
           Re-read the historical month before writing.
        */

        const monthSnapshot =
            await get(

                ref(
                    database,
                    `months/${month.id}`
                )

            );


        if (
            !monthSnapshot.exists()
        ) {

            window.alert(
                "This month no longer exists."
            );


            await loadAdminFirebaseData();


            return;

        }


        const currentMonth =
            {

                id:
                    month.id,

                ...monthSnapshot.val()

            };


        const currentStatus =
            getMonthStatus(
                currentMonth
            );


        if (
            currentStatus !==
            "FINALIZED"
        ) {

            window.alert(

                `${getMonthLabel(currentMonth)} is no longer finalized.\n\n` +

                `Current status: ${currentStatus}`

            );


            await loadAdminFirebaseData();


            return;

        }


        if (
            !isFinalizedSnapshotComplete(
                currentMonth.finalizedSnapshot
            )
        ) {

            window.alert(

                `${getMonthLabel(currentMonth)} has an incomplete finalized snapshot.\n\n` +

                `The month was not reopened.`

            );


            return;

        }


        const reopenedAt =
            Date.now();


        const updates =
            {};


        /*
           Update historical month status only.

           IMPORTANT:
           settings/activeMonth is deliberately untouched.
        */

        updates[
            `months/${month.id}/info/status`
        ] =
            "REOPENED";


        updates[
            `months/${month.id}/status`
        ] =
            "REOPENED";


        updates[
            `months/${month.id}/reopenedAt`
        ] =
            reopenedAt;


        await update(

            ref(
                database
            ),

            updates

        );


        window.alert(

            `${getMonthLabel(currentMonth)} has been reopened for corrections.\n\n` +

            `${getMonthLabel(activeMonthData)} remains the active league month.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to reopen historical month:",
            error
        );


        window.alert(
            "Unable to reopen the historical month. Please check the console for details."
        );

    }

    finally {

        if (
            reopenButton
        ) {

            reopenButton.disabled =
                false;


            reopenButton.textContent =
                "Reopen Month";

        }

    }

}

/* ============================================================
   HISTORICAL MONTH CORRECTION PANEL

   Step 11F-6B

   Read-only in this step.

   Important:
   - Does NOT change activeMonthId.
   - Does NOT change settings/activeMonth.
   - Does NOT allow new games.
   - Only displays games from the selected REOPENED month.
============================================================ */

function openHistoricalCorrectionMonth(
    month
) {

    if (
        !month?.id
    ) {

        window.alert(
            "Unable to identify this historical month."
        );


        return;

    }


    const status =
        getMonthStatus(
            month
        );


    if (
        status !==
        "REOPENED"
    ) {

        window.alert(
            "Only a reopened historical month can be managed."
        );


        return;

    }


    historicalCorrectionMonthId =
        month.id;


    historicalCorrectionMonthData =
        month;


    renderHistoricalCorrectionMonth();


    adminHistoricalCorrectionSection.classList.remove(
        "hidden"
    );


    adminHistoricalCorrectionSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}



/* ============================================================
   RENDER HISTORICAL CORRECTION MONTH
============================================================ */

function renderHistoricalCorrectionMonth() {

    if (
        !historicalCorrectionMonthId
        ||
        !historicalCorrectionMonthData
    ) {

        return;

    }


    const month =
        historicalCorrectionMonthData;


    const status =
        getMonthStatus(
            month
        );


    const games =
        month.games
        ||
        {};


    const allGames =
        Object.entries(
            games
        )
        .map(

            ([gameId, game]) => ({

                id:
                    gameId,

                ...game

            })

        );


    const completedGames =
        allGames
        .filter(

            (game) =>

                String(
                    game.status
                    ||
                    ""
                ).toUpperCase()
                ===
                "COMPLETED"

        )
        .sort(

            (gameA, gameB) =>

                Number(
                    gameB.gameNumber
                    ||
                    0
                )

                -

                Number(
                    gameA.gameNumber
                    ||
                    0
                )

        );


    const cancelledGames =
        allGames
        .filter(

            (game) =>

                String(
                    game.status
                    ||
                    ""
                ).toUpperCase()
                ===
                "CANCELLED"

        )
        .sort(

            (gameA, gameB) =>

                Number(
                    gameB.gameNumber
                    ||
                    0
                )

                -

                Number(
                    gameA.gameNumber
                    ||
                    0
                )

        );


    adminHistoricalCorrectionTitle.textContent =
        getMonthLabel(
            month
        );


    adminHistoricalCorrectionSubtitle.textContent =
        "This historical month is reopened for corrections. New games cannot be created here.";


    adminHistoricalCorrectionStatus.textContent =
        status;


    adminHistoricalCompletedCount.textContent =
        String(
            completedGames.length
        );


    adminHistoricalCancelledCount.textContent =
        String(
            cancelledGames.length
        );


    renderHistoricalCompletedGames(
        completedGames
    );


    renderHistoricalCancelledGames(
        cancelledGames
    );

}



/* ============================================================
   RENDER HISTORICAL COMPLETED GAMES
============================================================ */

function renderHistoricalCompletedGames(
    completedGames
) {

    adminHistoricalCompletedGamesList.innerHTML =
        "";


    if (
        completedGames.length ===
        0
    ) {

        adminHistoricalCompletedGamesList.innerHTML =
            `
                <div class="admin-empty-state">
                    No completed games in this month.
                </div>
            `;


        return;

    }


    completedGames.forEach(

        (game) => {

            adminHistoricalCompletedGamesList.appendChild(

                createHistoricalCompletedGameCard(
                    game
                )

            );

        }

    );

}



/* ============================================================
   CREATE HISTORICAL COMPLETED GAME CARD

   Read-only in Step 11F-6B.
============================================================ */

function createHistoricalCompletedGameCard(
    game
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-completed-game-card";


    const players =
        getGamePlayers(
            game
        );


    const totals =
        getGameTotals(
            game
        );


    const winnerIds =
        getWinnerIds(
            game
        );


    const winnerNames =
        players
        .filter(

            (player) =>

                winnerIds.includes(
                    player.id
                )

        )
        .map(

            (player) =>
                player.name

        )
        .join(
            ", "
        );


    const playerRows =
        players
        .map(

            (player) => {

                const isWinner =
                    winnerIds.includes(
                        player.id
                    );


                return `

                    <div class="admin-completed-player-row">

                        <span>

                            ${isWinner ? "★ " : ""}${escapeHtml(
                                player.name
                            )}

                        </span>


                        <strong>

                            ${escapeHtml(
                                totals[
                                    player.id
                                ]
                                ??
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


    card.innerHTML =
        `

            <div class="admin-completed-game-top">

                <div>

                    <strong class="admin-completed-game-number">

                        Game #${escapeHtml(
                            game.gameNumber
                            ||
                            "—"
                        )}

                    </strong>


                    <small>

                        ${formatAdminGameDate(
                            game.completedAt
                            ||
                            game.createdAt
                        )}

                    </small>

                </div>


                <span class="admin-completed-game-status">
                    COMPLETED
                </span>

            </div>


            <div class="admin-completed-winner">

                <span>

                    Winner${winnerIds.length === 1 ? "" : "s"}

                </span>


                <strong>

                    ${escapeHtml(
                        winnerNames
                        ||
                        "Unavailable"
                    )}

                </strong>

            </div>


            <div class="admin-completed-player-list">

                ${playerRows}

            </div>


            <div class="admin-completed-game-actions">

    <a
        class="admin-completed-game-view"
        href="game-details.html?month=${encodeURIComponent(
            historicalCorrectionMonthId
        )}&game=${encodeURIComponent(
            game.id
        )}"
    >
        View Game Details
    </a>


    <button
        type="button"
        class="admin-historical-game-edit"
        data-game-id="${escapeHtml(
            game.id
        )}"
    >
        Edit Scores
    </button>

</div>

        `;

const editButton =
    card.querySelector(
        ".admin-historical-game-edit"
    );


editButton.addEventListener(

    "click",

    () => {

        openCompletedGameEditor(

            game,
            historicalCorrectionMonthId,
            historicalCorrectionMonthData

        );

    }

);

    return card;

}



/* ============================================================
   RENDER HISTORICAL CANCELLED GAMES
============================================================ */

function renderHistoricalCancelledGames(
    cancelledGames
) {

    adminHistoricalCancelledGamesList.innerHTML =
        "";


    if (
        cancelledGames.length ===
        0
    ) {

        adminHistoricalCancelledGamesList.innerHTML =
            `
                <div class="admin-empty-state">
                    No cancelled games.
                </div>
            `;


        return;

    }


    cancelledGames.forEach(

        (game) => {

            adminHistoricalCancelledGamesList.appendChild(

                createHistoricalCancelledGameCard(
                    game
                )

            );

        }

    );

}



/* ============================================================
   CREATE HISTORICAL CANCELLED GAME CARD
============================================================ */

function createHistoricalCancelledGameCard(
    game
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "admin-historical-cancelled-game";


    const players =
        getGamePlayers(
            game
        );


    const playerNames =
        players
        .map(

            (player) =>
                player.name

        )
        .join(
            " • "
        );


    card.innerHTML =
        `

            <div class="admin-historical-cancelled-top">

                <strong>
                    Game #${escapeHtml(
                        game.gameNumber
                        ||
                        "—"
                    )}
                </strong>


                <span>
                    CANCELLED
                </span>

            </div>


            <div class="admin-historical-cancelled-players">

                ${escapeHtml(
                    playerNames
                    ||
                    "Players unavailable"
                )}

            </div>


            <a
                class="admin-completed-game-view"
                href="game-details.html?month=${encodeURIComponent(
                    historicalCorrectionMonthId
                )}&game=${encodeURIComponent(
                    game.id
                )}"
            >
                View Game Details
            </a>

        `;


    return card;

}

/* ============================================================
   RE-FINALIZE REOPENED HISTORICAL MONTH

   Step 11F-6D

   Rules:
   - Only a REOPENED historical month can use this.
   - settings/activeMonth is NEVER changed.
   - No new games are created.
   - Snapshot is rebuilt from current COMPLETED games.
   - Month becomes FINALIZED again.
============================================================ */

adminHistoricalRefinalizeButton.addEventListener(

    "click",

    () => {

        validateHistoricalMonthRefinalization();

    }

);



/* ============================================================
   VALIDATE HISTORICAL MONTH RE-FINALIZATION
============================================================ */

function validateHistoricalMonthRefinalization() {

    if (
        !historicalCorrectionMonthId
        ||
        !historicalCorrectionMonthData
    ) {

        window.alert(
            "No historical month is currently open."
        );


        return;

    }


    const monthStatus =
        getMonthStatus(
            historicalCorrectionMonthData
        );


    if (
        monthStatus !==
        "REOPENED"
    ) {

        window.alert(
            "Only a reopened historical month can be re-finalized."
        );


        return;

    }


    /*
       If the score editor is still open for this
       historical month, require Admin to finish
       or close it first.
    */

    if (
        editingGameMonthId
        &&
        String(
            editingGameMonthId
        )
        ===
        String(
            historicalCorrectionMonthId
        )
    ) {

        window.alert(

            "A game from this month is still open in the score editor.\n\n" +

            "Save or close the score editor before re-finalizing the month."

        );


        return;

    }


    const completedGames =
        countGamesByStatus(
            historicalCorrectionMonthData,
            "COMPLETED"
        );


    if (
        completedGames ===
        0
    ) {

        window.alert(
            "This historical month has no completed games to finalize."
        );


        return;

    }


    const activeGames =
        countGamesByStatus(
            historicalCorrectionMonthData,
            "ACTIVE"
        );


    if (
        activeGames > 0
    ) {

        window.alert(

            `This historical month still contains ${activeGames} active game${activeGames === 1 ? "" : "s"}.\n\n` +

            `It cannot be re-finalized.`

        );


        return;

    }


    const confirmed =
        window.confirm(

            `Re-finalize ${getMonthLabel(historicalCorrectionMonthData)}?\n\n` +

            `Completed games: ${completedGames}\n\n` +

            `The standings, categories, cutoff and records will be recalculated from the corrected completed games.\n\n` +

            `The existing frozen snapshot will be replaced.\n\n` +

            `${getMonthLabel(activeMonthData)} will remain the active league month.\n\n` +

            `Continue?`

        );


    if (
        !confirmed
    ) {

        return;

    }


    refinalizeHistoricalMonth();

}

/* ============================================================
   WRITE RE-FINALIZED HISTORICAL MONTH
============================================================ */

async function refinalizeHistoricalMonth() {

    const targetMonthId =
        historicalCorrectionMonthId;


    if (
        !targetMonthId
    ) {

        window.alert(
            "Unable to identify the historical month."
        );


        return;

    }


    adminHistoricalRefinalizeButton.disabled =
        true;


    adminHistoricalCorrectionCloseButton.disabled =
        true;


    adminHistoricalRefinalizeButton.textContent =
        "Re-finalizing...";


    try {

        /*
           Always re-read the complete historical month
           immediately before rebuilding its snapshot.

           This ensures we use the latest corrected scores.
        */

        const monthSnapshot =
            await get(

                ref(
                    database,
                    `months/${targetMonthId}`
                )

            );


        if (
            !monthSnapshot.exists()
        ) {

            window.alert(
                "This historical month no longer exists."
            );


            return;

        }


        const currentMonth =
            {

                id:
                    targetMonthId,

                ...monthSnapshot.val()

            };


        const currentStatus =
            getMonthStatus(
                currentMonth
            );


        /*
           It must still be REOPENED at write time.
        */

        if (
            currentStatus !==
            "REOPENED"
        ) {

            window.alert(

                `${getMonthLabel(currentMonth)} is no longer reopened.\n\n` +

                `Current status: ${currentStatus}\n\n` +

                `No changes were made.`

            );


            await loadAdminFirebaseData();


            return;

        }


        /*
           Safety check:
           a reopened historical month should never
           contain ACTIVE games.
        */

        const activeGames =
            countGamesByStatus(
                currentMonth,
                "ACTIVE"
            );


        if (
            activeGames > 0
        ) {

            window.alert(

                `${getMonthLabel(currentMonth)} contains ${activeGames} active game${activeGames === 1 ? "" : "s"}.\n\n` +

                `The month cannot be re-finalized.`

            );


            return;

        }


        const completedGames =
            countGamesByStatus(
                currentMonth,
                "COMPLETED"
            );


        if (
            completedGames ===
            0
        ) {

            window.alert(
                "This historical month has no completed games to finalize."
            );


            return;

        }


        /*
           Build a completely fresh frozen snapshot
           from the corrected game data.
        */

        const finalizedSnapshot =
            buildFinalizedSnapshot(
                currentMonth
            );


        const finalizedAt =
            Date.now();


        finalizedSnapshot.finalizedAt =
            finalizedAt;


        const updates =
            {};


        /*
           Replace the previous snapshot.
        */

        updates[
            `months/${targetMonthId}/finalizedSnapshot`
        ] =
            finalizedSnapshot;


        /*
           Return month to FINALIZED.
        */

        updates[
            `months/${targetMonthId}/info/status`
        ] =
            "FINALIZED";


        updates[
            `months/${targetMonthId}/status`
        ] =
            "FINALIZED";


        updates[
            `months/${targetMonthId}/info/finalizedAt`
        ] =
            finalizedAt;


        updates[
            `months/${targetMonthId}/finalizedAt`
        ] =
            finalizedAt;


        /*
           The historical month is no longer reopened.

           Setting a Firebase value to null removes it.
        */

        updates[
            `months/${targetMonthId}/reopenedAt`
        ] =
            null;


        /*
           IMPORTANT:

           There is intentionally NO update to:

           settings/activeMonth

           October therefore stays the active league month.
        */

        await update(

            ref(
                database
            ),

            updates

        );


        window.alert(

            `${getMonthLabel(currentMonth)} has been re-finalized successfully.\n\n` +

            `Its standings, categories and records have been frozen again.\n\n` +

            `${getMonthLabel(activeMonthData)} remains the active league month.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to re-finalize historical month:",
            error
        );


        window.alert(
            "Unable to re-finalize the historical month. Please check the console for details."
        );

    }

    finally {

        adminHistoricalRefinalizeButton.disabled =
            false;


        adminHistoricalCorrectionCloseButton.disabled =
            false;


        adminHistoricalRefinalizeButton.textContent =
            "Re-finalize Month";

    }

}

/* ============================================================
   CLOSE HISTORICAL CORRECTION MONTH
============================================================ */

adminHistoricalCorrectionCloseButton.addEventListener(

    "click",

    () => {

        closeHistoricalCorrectionMonth();

    }

);



function closeHistoricalCorrectionMonth() {

    historicalCorrectionMonthId =
        null;


    historicalCorrectionMonthData =
        null;


    adminHistoricalCorrectionTitle.textContent =
        "Historical Month";


    adminHistoricalCorrectionSubtitle.textContent =
        "Review games stored in this reopened month.";


    adminHistoricalCorrectionStatus.textContent =
        "—";


    adminHistoricalCompletedCount.textContent =
        "0";


    adminHistoricalCancelledCount.textContent =
        "0";


    adminHistoricalCompletedGamesList.innerHTML =
        `
            <div class="admin-empty-state">
                Select a reopened month.
            </div>
        `;


    adminHistoricalCancelledGamesList.innerHTML =
        `
            <div class="admin-empty-state">
                No cancelled games.
            </div>
        `;


    adminHistoricalCorrectionSection.classList.add(
        "hidden"
    );

}

/* ============================================================
   EDIT PLAYER NAME

   Step 11G-3

   Rules:
   - Player ID never changes.
   - Only the master player name is changed.
   - Historical games are NOT rewritten.
   - Duplicate names are not allowed.
   - Comparison is case-insensitive.
============================================================ */

async function editAdminPlayerName(
    player
) {

    if (
        !player?.id
    ) {

        window.alert(
            "Unable to identify this player."
        );


        return;

    }


    const currentName =
        cleanAdminPlayerName(
            player.name
        );


    const enteredName =
        window.prompt(

            "Edit player name:\n\n" +
            "Historical completed games will remain unchanged.",

            currentName

        );


    /*
       Cancel button was pressed.
    */

    if (
        enteredName ===
        null
    ) {

        return;

    }


    const newName =
        cleanAdminPlayerName(
            enteredName
        );


    if (
        !newName
    ) {

        window.alert(
            "Player name cannot be empty."
        );


        return;

    }


    if (
        newName.length <
        2
    ) {

        window.alert(
            "Player name must contain at least 2 characters."
        );


        return;

    }


    if (
        newName.length >
        40
    ) {

        window.alert(
            "Player name cannot be longer than 40 characters."
        );


        return;

    }


    /*
       If nothing actually changed,
       there is nothing to save.
    */

    if (
        newName ===
        currentName
    ) {

        return;

    }


    /*
       Duplicate check using the currently
       loaded Admin player list.

       Ignore the player being edited.
    */

    const duplicatePlayer =
        allPlayers.find(

            (existingPlayer) =>

                String(
                    existingPlayer.id
                )
                !==
                String(
                    player.id
                )

                &&

                normalizeAdminPlayerName(
                    existingPlayer.name
                )
                ===
                normalizeAdminPlayerName(
                    newName
                )

        );


    if (
        duplicatePlayer
    ) {

        window.alert(

            `${duplicatePlayer.name} already exists.\n\n` +

            `Choose a different player name.`

        );


        return;

    }


    const confirmed =
        window.confirm(

            `Change player name?\n\n` +

            `${currentName}\n` +

            `↓\n` +

            `${newName}\n\n` +

            `The player's Firebase ID will remain unchanged.\n\n` +

            `Historical completed games will keep the names already stored inside those games.\n\n` +

            `Continue?`

        );


    if (
        !confirmed
    ) {

        return;

    }


    await saveAdminPlayerName(

        player,
        newName

    );

}



/* ============================================================
   SAVE EDITED PLAYER NAME
============================================================ */

async function saveAdminPlayerName(
    player,
    newName
) {

    const editButton =
        document.querySelector(

            `.admin-player-edit-button[data-player-id="${CSS.escape(
                String(
                    player.id
                )
            )}"]`

        );


    if (
        editButton
    ) {

        editButton.disabled =
            true;


        editButton.textContent =
            "Saving...";

    }


    try {

        /*
           Re-read all players before saving.

           This protects against another Admin adding
           or renaming somebody to the same name after
           this page was loaded.
        */

        const playersSnapshot =
            await get(

                ref(
                    database,
                    "players"
                )

            );


        const latestPlayers =
            snapshotToPlayers(
                playersSnapshot
            );


        /*
           Confirm this player still exists.
        */

        const latestPlayer =
            latestPlayers.find(

                (existingPlayer) =>

                    String(
                        existingPlayer.id
                    )
                    ===
                    String(
                        player.id
                    )

            );


        if (
            !latestPlayer
        ) {

            window.alert(
                "This player no longer exists."
            );


            await loadAdminFirebaseData();


            return;

        }


        /*
           Final duplicate-name protection.
        */

        const duplicatePlayer =
            latestPlayers.find(

                (existingPlayer) =>

                    String(
                        existingPlayer.id
                    )
                    !==
                    String(
                        player.id
                    )

                    &&

                    normalizeAdminPlayerName(
                        existingPlayer.name
                    )
                    ===
                    normalizeAdminPlayerName(
                        newName
                    )

            );


        if (
            duplicatePlayer
        ) {

            window.alert(

                `${duplicatePlayer.name} already exists.\n\n` +

                `The player name was not changed.`

            );


            await loadAdminFirebaseData();


            return;

        }


        const updatedAt =
            Date.now();


        await update(

            ref(
                database,
                `players/${player.id}`
            ),

            {

                name:
                    newName,

                updatedAt:
                    updatedAt

            }

        );


        window.alert(

            `${latestPlayer.name} has been renamed to ${newName}.`

        );


        await loadAdminFirebaseData();

    }

    catch (error) {

        console.error(
            "Unable to edit player name:",
            error
        );


        window.alert(
            "Unable to edit the player name. Please check the console for details."
        );

    }

    finally {

        if (
            editButton
        ) {

            editButton.disabled =
                false;


            editButton.textContent =
                "Edit Name";

        }

    }

}

/* ============================================================
   ADD PLAYER FROM ADMIN

   Step 11G-2

   Rules:
   - Name required.
   - Minimum 2 characters.
   - Maximum 40 characters.
   - Duplicate names are not allowed.
   - Duplicate comparison is case-insensitive.
   - New players are ACTIVE by default.
============================================================ */

async function addPlayerFromAdmin() {

    const playerName =
        cleanAdminPlayerName(
            adminPlayerNameInput.value
        );


    if (
        !playerName
    ) {

        window.alert(
            "Please enter a player name."
        );


        adminPlayerNameInput.focus();


        return;

    }


    if (
        playerName.length <
        2
    ) {

        window.alert(
            "Player name must contain at least 2 characters."
        );


        adminPlayerNameInput.focus();

        adminPlayerNameInput.select();


        return;

    }


    if (
        playerName.length >
        40
    ) {

        window.alert(
            "Player name cannot be longer than 40 characters."
        );


        adminPlayerNameInput.focus();

        adminPlayerNameInput.select();


        return;

    }


    /*
       Duplicate check.

       Hassan, HASSAN and hassan are treated
       as the same player name.
    */

    const duplicatePlayer =
        allPlayers.find(

            (player) =>

                normalizeAdminPlayerName(
                    player.name
                )
                ===
                normalizeAdminPlayerName(
                    playerName
                )

        );


    if (
        duplicatePlayer
    ) {

        window.alert(

            `${duplicatePlayer.name} already exists.`

        );


        adminPlayerNameInput.focus();

        adminPlayerNameInput.select();


        return;

    }


    const confirmed =
        window.confirm(

            `Add ${playerName} as a new player?\n\n` +

            `The player will be active immediately and available for new games.`

        );


    if (
        !confirmed
    ) {

        return;

    }


    adminAddPlayerButton.disabled =
        true;


    adminPlayerNameInput.disabled =
        true;


    adminAddPlayerButton.textContent =
        "Adding...";


    try {

        /*
           Re-read players immediately before writing.

           This avoids creating a duplicate if another
           Admin added the same player after this page
           was loaded.
        */

        const playersSnapshot =
            await get(

                ref(
                    database,
                    "players"
                )

            );


        const latestPlayers =
            snapshotToPlayers(
                playersSnapshot
            );


        const latestDuplicate =
            latestPlayers.find(

                (player) =>

                    normalizeAdminPlayerName(
                        player.name
                    )
                    ===
                    normalizeAdminPlayerName(
                        playerName
                    )

            );


        if (
            latestDuplicate
        ) {

            window.alert(

                `${latestDuplicate.name} already exists.\n\n` +

                `No new player was added.`

            );


            return;

        }


        const newPlayerRef =
            push(

                ref(
                    database,
                    "players"
                )

            );


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


        adminPlayerNameInput.value =
            "";


        window.alert(

            `${playerName} was added successfully.`

        );


        await loadAdminFirebaseData();


        adminPlayerNameInput.focus();

    }

    catch (error) {

        console.error(
            "Unable to add player:",
            error
        );


        window.alert(
            "Unable to add the player. Please check the console for details."
        );

    }

    finally {

        adminAddPlayerButton.disabled =
            false;


        adminPlayerNameInput.disabled =
            false;


        adminAddPlayerButton.textContent =
            "Add Player";

    }

}



/* ============================================================
   CLEAN ADMIN PLAYER NAME

   Example:

   "   Hassan   Jaufar   "

   becomes:

   "Hassan Jaufar"
============================================================ */

function cleanAdminPlayerName(
    playerName
) {

    return String(
        playerName
        ||
        ""
    )
    .trim()
    .replace(
        /\s+/g,
        " "
    );

}



/* ============================================================
   NORMALIZE PLAYER NAME FOR DUPLICATE CHECK
============================================================ */

function normalizeAdminPlayerName(
    playerName
) {

    return cleanAdminPlayerName(
        playerName
    ).toLocaleLowerCase();

}

/* ============================================================
   PLAYER MANAGEMENT

   Step 11G-1

   Read-only in this step.

   Shows:
   - Total players
   - Active players
   - Inactive players
   - Player name
   - Player status

   No player data is changed here.
============================================================ */

function renderPlayersManagement() {

    adminPlayersList.innerHTML =
        "";


    const totalPlayers =
        allPlayers.length;


    const activePlayers =
        allPlayers.filter(

            (player) =>

                player.active !==
                false

        );


    const inactivePlayers =
        allPlayers.filter(

            (player) =>

                player.active ===
                false

        );


    adminTotalPlayersCount.textContent =
        String(
            totalPlayers
        );


    adminActivePlayersCount.textContent =
        String(
            activePlayers.length
        );


    adminInactivePlayersCount.textContent =
        String(
            inactivePlayers.length
        );


    if (
        totalPlayers ===
        0
    ) {

        adminPlayersList.innerHTML =
            `
                <div class="admin-empty-state">
                    No players have been added yet.
                </div>
            `;


        return;

    }


    allPlayers.forEach(

        (player) => {

            adminPlayersList.appendChild(

                createAdminPlayerRow(
                    player
                )

            );

        }

    );

}



/* ============================================================
   CREATE ADMIN PLAYER ROW
============================================================ */

function createAdminPlayerRow(
    player
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "admin-player-row";


    const isActive =
        player.active !==
        false;


    row.innerHTML =
        `

            <div class="admin-player-row-main">

                <div class="admin-player-avatar">
                    ${escapeHtml(
                        getPlayerInitial(
                            player.name
                        )
                    )}
                </div>


                <div class="admin-player-info">

                    <strong>
                        ${escapeHtml(
                            player.name
                            ||
                            "Unnamed Player"
                        )}
                    </strong>


                    <small>
                        Family Card League Player
                    </small>

                </div>

            </div>


            <div class="admin-player-row-side">

    <span
        class="admin-player-status
        ${isActive
            ? "admin-player-status-active"
            : "admin-player-status-inactive"
        }"
    >

        ${isActive
            ? "ACTIVE"
            : "INACTIVE"
        }

    </span>


    <button
        type="button"
        class="admin-player-edit-button"
        data-player-id="${escapeHtml(
            player.id
        )}"
    >
        Edit Name
    </button>

</div>

        `;

        const editButton =
    row.querySelector(
        ".admin-player-edit-button"
    );


editButton.addEventListener(

    "click",

    () => {

        editAdminPlayerName(
            player
        );

    }

);

    return row;

}



/* ============================================================
   GET PLAYER INITIAL
============================================================ */

function getPlayerInitial(
    playerName
) {

    const cleanName =
        String(
            playerName
            ||
            ""
        ).trim();


    if (
        !cleanName
    ) {

        return "?";

    }


    return cleanName
        .charAt(
            0
        )
        .toUpperCase();

}

/* ============================================================
   18. COUNT GAMES BY STATUS
============================================================ */

function countGamesByStatus(
    month,
    wantedStatus
) {

    const games =
        month?.games
        ||
        {};


    let count =
        0;


    Object.values(
        games
    ).forEach(

        (game) => {

            if (
                String(
                    game?.status
                    ||
                    ""
                ).toUpperCase()
                ===
                wantedStatus
            ) {

                count +=
                    1;

            }

        }

    );


    return count;

}



/* ============================================================
   19. GET MONTH STATUS
============================================================ */

function getMonthStatus(
    month
) {

    return String(

        month?.info?.status
        ||
        month?.status
        ||
        "ACTIVE"

    ).toUpperCase();

}



/* ============================================================
   20. GET MONTH LABEL
============================================================ */

function getMonthLabel(
    month
) {

    if (
        month?.info?.label
    ) {

        return month.info.label;

    }


    if (
        month?.label
    ) {

        return month.label;

    }


    return buildMonthLabel(
        month?.id
    );

}



/* ============================================================
   21. BUILD MONTH LABEL
============================================================ */

function buildMonthLabel(
    monthId
) {

    const parts =
        String(
            monthId
            ||
            ""
        ).split(
            "-"
        );


    if (
        parts.length !==
        2
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
   22. RESET ADMIN SUMMARY
============================================================ */

function resetAdminSummary() {

    adminActiveMonthLabel.textContent =
        "Loading...";


    adminActiveMonthStatus.textContent =
        "—";


    adminCompletedGamesCount.textContent =
        "—";


    adminActiveGamesCount.textContent =
        "—";


    adminFinalizedMonthsList.innerHTML =
        `
            <div class="admin-empty-state">
                Loading months...
            </div>
        `;
        adminActiveGamesList.innerHTML =
    `
        <div class="admin-empty-state">
            Loading active games...
        </div>
    `;
    adminCompletedGamesList.innerHTML =
    `
        <div class="admin-empty-state">
            Loading completed games...
        </div>
    `;

    adminTotalPlayersCount.textContent =
    "—";


adminActivePlayersCount.textContent =
    "—";


adminInactivePlayersCount.textContent =
    "—";


adminPlayersList.innerHTML =
    `
        <div class="admin-empty-state">
            Loading players...
        </div>
    `;

}



/* ============================================================
   23. ESCAPE HTML
============================================================ */

function escapeHtml(
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

/* ============================================================
   BUILD FINALIZED SNAPSHOT
============================================================ */

function buildFinalizedSnapshot(
    month
) {

    const completedGames =
        getCompletedGames(
            month
        );


    const standings =
        buildFinalizedStandings(
            completedGames
        );


    const maxGamesPlayed =
        standings.reduce(

            (maximum, player) =>

                Math.max(
                    maximum,
                    player.gamesPlayed
                ),

            0

        );


    const categoryCutoff =
        maxGamesPlayed > 0
            ? Math.ceil(
                maxGamesPlayed / 2
            )
            : 0;


    const category1 =
        standings
        .filter(

            (player) =>

                player.gamesPlayed >=
                categoryCutoff

        )
        .map(
            cloneStanding
        );


    const category2 =
        standings
        .filter(

            (player) =>

                player.gamesPlayed > 0
                &&
                player.gamesPlayed <
                categoryCutoff

        )
        .map(
            cloneStanding
        );


    sortAndRankStandings(
        category1
    );


    sortAndRankStandings(
        category2
    );


    const records =
        buildFinalizedRecords(
            completedGames,
            standings
        );


    const uniquePlayers =
        new Set();


    completedGames.forEach(

        (game) => {

            getGamePlayers(
                game
            ).forEach(

                (player) => {

                    if (
                        player.id
                    ) {

                        uniquePlayers.add(
                            player.id
                        );

                    }

                }

            );

        }

    );


    return {

        monthId:
            month.id,

        monthLabel:
            getMonthLabel(
                month
            ),

        status:
            "FINALIZED",

        gameCount:
            completedGames.length,

        playerCount:
            uniquePlayers.size,

        categoryCutoff:
            categoryCutoff,

        standings:
            standings,

        categories: {

            category1:
                category1,

            category2:
                category2

        },

        records:
            records

    };

}



/* ============================================================
   GET COMPLETED GAMES
============================================================ */

function getCompletedGames(
    month
) {

    const games =
        month?.games
        ||
        {};


    return Object.entries(
        games
    )
    .map(

        ([gameId, game]) => ({

            id:
                gameId,

            ...game

        })

    )
    .filter(

        (game) =>

            String(
                game.status
                ||
                ""
            ).toUpperCase()
            ===
            "COMPLETED"

    );

}



/* ============================================================
   BUILD FINALIZED STANDINGS
============================================================ */

function buildFinalizedStandings(
    completedGames
) {

    const playerMap =
        new Map();


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            const totals =
                getGameTotals(
                    game
                );


            const winnerIds =
                getWinnerIds(
                    game
                );


            gamePlayers.forEach(

                (player) => {

                    if (
                        !player.id
                    ) {

                        return;

                    }


                    if (
                        !playerMap.has(
                            player.id
                        )
                    ) {

                        playerMap.set(

                            player.id,

                            {
                                playerId:
                                    player.id,

                                playerName:
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
                                    0
                            }

                        );

                    }


                    const standing =
                        playerMap.get(
                            player.id
                        );


                    standing.gamesPlayed +=
                        1;


                    standing.totalPoints +=
                        Number(
                            totals[
                                player.id
                            ]
                            ??
                            0
                        );


                    if (
                        winnerIds.includes(
                            player.id
                        )
                    ) {

                        standing.gamesWon +=
                            1;

                    }

                }

            );

        }

    );


    const standings =
        Array.from(
            playerMap.values()
        );


    standings.forEach(

        (standing) => {

            standing.winPercentage =

                standing.gamesPlayed > 0

                    ? (
                        standing.gamesWon
                        /
                        standing.gamesPlayed
                        *
                        100
                    )

                    : 0;

        }

    );


    sortAndRankStandings(
        standings
    );


    return standings;

}



/* ============================================================
   SORT + RANK STANDINGS

   Ranking:
   1. Total Points
   2. Win %
   3. Games Won
   4. Exact tie = joint rank
============================================================ */

function sortAndRankStandings(
    standings
) {

    standings.sort(

        (playerA, playerB) => {

            if (
                playerB.totalPoints !==
                playerA.totalPoints
            ) {

                return (
                    playerB.totalPoints
                    -
                    playerA.totalPoints
                );

            }


            if (
                playerB.winPercentage !==
                playerA.winPercentage
            ) {

                return (
                    playerB.winPercentage
                    -
                    playerA.winPercentage
                );

            }


            if (
                playerB.gamesWon !==
                playerA.gamesWon
            ) {

                return (
                    playerB.gamesWon
                    -
                    playerA.gamesWon
                );

            }


            return String(
                playerA.playerName
            ).localeCompare(
                String(
                    playerB.playerName
                )
            );

        }

    );


    let previous =
        null;


    standings.forEach(

        (standing, index) => {

            if (
                previous
                &&
                standing.totalPoints ===
                    previous.totalPoints
                &&
                standing.winPercentage ===
                    previous.winPercentage
                &&
                standing.gamesWon ===
                    previous.gamesWon
            ) {

                standing.rank =
                    previous.rank;

            }

            else {

                standing.rank =
                    index + 1;

            }


            previous =
                standing;

        }

    );

}



/* ============================================================
   CLONE STANDING
============================================================ */

function cloneStanding(
    standing
) {

    return {

        playerId:
            standing.playerId,

        playerName:
            standing.playerName,

        gamesPlayed:
            standing.gamesPlayed,

        gamesWon:
            standing.gamesWon,

        winPercentage:
            standing.winPercentage,

        totalPoints:
            standing.totalPoints,

        rank:
            standing.rank

    };

}



/* ============================================================
   BUILD FINALIZED RECORDS
============================================================ */

function buildFinalizedRecords(
    completedGames,
    standings
) {

    const standingMap =
        new Map();


    standings.forEach(

        (standing) => {

            standingMap.set(
                standing.playerId,
                standing
            );

        }

    );


    let highestSingle =
        null;


    let lowestSingle =
        null;


    let highestGame =
        null;


    let lowestGame =
        null;


    completedGames.forEach(

        (game) => {

            const players =
                getGamePlayers(
                    game
                );


            const totals =
                getGameTotals(
                    game
                );


            players.forEach(

                (player) => {

                    const standing =
                        standingMap.get(
                            player.id
                        );


                    const totalCandidate =
                        createRecordCandidate({

                            player:
                                player,

                            score:
                                Number(
                                    totals[
                                        player.id
                                    ]
                                    ??
                                    0
                                ),

                            game:
                                game,

                            matchNumber:
                                null,

                            standing:
                                standing

                        });


                    highestGame =
                        chooseRecordCandidate(
                            highestGame,
                            totalCandidate,
                            "HIGH"
                        );


                    lowestGame =
                        chooseRecordCandidate(
                            lowestGame,
                            totalCandidate,
                            "LOW"
                        );

                }

            );


            const matches =
                getGameMatches(
                    game
                );


            matches.forEach(

                (match) => {

                    players.forEach(

                        (player) => {

                            const score =
                                getMatchScore(
                                    match,
                                    player.id
                                );


                            if (
                                score ===
                                null
                            ) {

                                return;

                            }


                            const standing =
                                standingMap.get(
                                    player.id
                                );


                            const candidate =
                                createRecordCandidate({

                                    player:
                                        player,

                                    score:
                                        score,

                                    game:
                                        game,

                                    matchNumber:
                                        match.matchNumber,

                                    standing:
                                        standing

                                });


                            highestSingle =
                                chooseRecordCandidate(
                                    highestSingle,
                                    candidate,
                                    "HIGH"
                                );


                            lowestSingle =
                                chooseRecordCandidate(
                                    lowestSingle,
                                    candidate,
                                    "LOW"
                                );

                        }

                    );

                }

            );

        }

    );


    return {

        highestSingleMatch:
            stripRecordTieBreakerData(
                highestSingle
            ),

        lowestSingleMatch:
            stripRecordTieBreakerData(
                lowestSingle
            ),

        highestGameTotal:
            stripRecordTieBreakerData(
                highestGame
            ),

        lowestGameTotal:
            stripRecordTieBreakerData(
                lowestGame
            )

    };

}



/* ============================================================
   CREATE RECORD CANDIDATE
============================================================ */

function createRecordCandidate(
    {
        player,
        score,
        game,
        matchNumber,
        standing
    }
) {

    return {

        playerId:
            player.id,

        playerName:
            player.name,

        score:
            score,

        gameNumber:
            Number(
                game.gameNumber
                ||
                0
            ),

        matchNumber:
            matchNumber,

        date:
            Number(
                game.completedAt
                ||
                game.createdAt
                ||
                0
            ),

        winPercentage:
            Number(
                standing?.winPercentage
                ||
                0
            ),

        gamesWon:
            Number(
                standing?.gamesWon
                ||
                0
            )

    };

}



/* ============================================================
   CHOOSE RECORD CANDIDATE

   Tie-break:
   1. Record value
   2. Higher monthly Win %
   3. More monthly Games Won
   4. Alphabetical
============================================================ */

function chooseRecordCandidate(
    current,
    candidate,
    direction
) {

    if (
        !current
    ) {

        return candidate;

    }


    if (
        direction ===
        "HIGH"
    ) {

        if (
            candidate.score >
            current.score
        ) {

            return candidate;

        }


        if (
            candidate.score <
            current.score
        ) {

            return current;

        }

    }

    else {

        if (
            candidate.score <
            current.score
        ) {

            return candidate;

        }


        if (
            candidate.score >
            current.score
        ) {

            return current;

        }

    }


    if (
        candidate.winPercentage >
        current.winPercentage
    ) {

        return candidate;

    }


    if (
        candidate.winPercentage <
        current.winPercentage
    ) {

        return current;

    }


    if (
        candidate.gamesWon >
        current.gamesWon
    ) {

        return candidate;

    }


    if (
        candidate.gamesWon <
        current.gamesWon
    ) {

        return current;

    }


    return String(
        candidate.playerName
    ).localeCompare(
        String(
            current.playerName
        )
    ) < 0

        ? candidate
        : current;

}



/* ============================================================
   STRIP RECORD TIE-BREAK DATA
============================================================ */

function stripRecordTieBreakerData(
    record
) {

    if (
        !record
    ) {

        return null;

    }


    return {

        playerId:
            record.playerId,

        playerName:
            record.playerName,

        score:
            record.score,

        gameNumber:
            record.gameNumber,

        matchNumber:
            record.matchNumber,

        date:
            record.date

    };

}



/* ============================================================
   GET GAME PLAYERS
============================================================ */

function getGamePlayers(
    game
) {

    const rawPlayers =
        game?.players;


    if (
        !rawPlayers
    ) {

        return [];

    }


    /*
       ARRAY FORMAT

       Example:
       [
           {
               id: "player-id",
               name: "Hassan"
           }
       ]
    */

    if (
        Array.isArray(
            rawPlayers
        )
    ) {

        return rawPlayers
        .filter(
            Boolean
        )
        .map(
            normalizeGamePlayer
        )
        .filter(

            (player) =>

                player.id

        );

    }


    /*
       FIREBASE OBJECT FORMAT

       This is the format your actual games use:

       players: {
           "-PLAYER-ID": {
               name: "Hassan",
               seat: 1
           }
       }

       The Firebase OBJECT KEY is the player ID.
    */

    if (
        typeof rawPlayers ===
        "object"
    ) {

        return Object.entries(
            rawPlayers
        )
        .filter(

            ([, player]) =>

                Boolean(
                    player
                )

        )
        .map(

            ([playerId, player]) => {

                const normalized =
                    normalizeGamePlayer(
                        player
                    );


                /*
                   The stored player object may not contain
                   its own id.

                   In that case the Firebase key IS the id.
                */

                if (
                    !normalized.id
                ) {

                    normalized.id =
                        String(
                            playerId
                        );

                }


                return normalized;

            }

        )
        .filter(

            (player) =>

                player.id

        );

    }


    return [];

}



/* ============================================================
   NORMALIZE GAME PLAYER
============================================================ */

function normalizeGamePlayer(
    player
) {

    if (
        typeof player ===
        "string"
    ) {

        return {

            id:
                player,

            name:
                player

        };

    }


    return {

        id:
            player?.id
            ||
            player?.playerId
            ||
            player?.uid
            ||
            "",

        name:
            player?.name
            ||
            player?.playerName
            ||
            "Unknown Player"

    };

}



/* ============================================================
   GET GAME TOTALS
============================================================ */

function getGameTotals(
    game
) {

    if (
        game?.finalTotals
        &&
        typeof game.finalTotals ===
            "object"
    ) {

        return game.finalTotals;

    }


    const totals =
        {};


    const players =
        getGamePlayers(
            game
        );


    players.forEach(

        (player) => {

            totals[
                player.id
            ] =
                0;

        }

    );


    getGameMatches(
        game
    ).forEach(

        (match) => {

            players.forEach(

                (player) => {

                    const score =
                        getMatchScore(
                            match,
                            player.id
                        );


                    if (
                        score !==
                        null
                    ) {

                        totals[
                            player.id
                        ] +=
                            score;

                    }

                }

            );

        }

    );


    return totals;

}



/* ============================================================
   GET WINNER IDS
============================================================ */

function getWinnerIds(
    game
) {

    const winners =
        game?.winners;


    if (
        !winners
    ) {

        return [];

    }


    if (
        Array.isArray(
            winners
        )
    ) {

        return winners.map(

            (winner) =>

                typeof winner ===
                "string"

                    ? winner

                    : winner?.id
                    ||
                    winner?.playerId

        )
        .filter(
            Boolean
        );

    }


    if (
        typeof winners ===
        "object"
    ) {

        return Object.entries(
            winners
        )
        .map(

            ([key, value]) => {

                if (
                    value === true
                ) {

                    return key;

                }


                if (
                    typeof value ===
                    "string"
                ) {

                    return value;

                }


                return (
                    value?.id
                    ||
                    value?.playerId
                    ||
                    key
                );

            }

        )
        .filter(
            Boolean
        );

    }


    return [];

}



/* ============================================================
   GET GAME MATCHES
============================================================ */

function getGameMatches(
    game
) {

    const matches =
        game?.matches;


    if (
        !matches
    ) {

        return [];

    }


    return Object.entries(
        matches
    )
    .map(

        ([key, value]) => ({

            matchNumber:
                Number(
                    value?.matchNumber
                    ||
                    key
                ),

            ...value

        })

    )
    .sort(

        (matchA, matchB) =>

            matchA.matchNumber
            -
            matchB.matchNumber

    );

}



/* ============================================================
   GET MATCH SCORE
============================================================ */

function getMatchScore(
    match,
    playerId
) {

    const possibleContainers =
        [
            match?.scores,
            match?.playerScores,
            match
        ];


    for (
        const container
        of possibleContainers
    ) {

        if (
            !container
            ||
            typeof container !==
                "object"
        ) {

            continue;

        }


        const value =
            container[
                playerId
            ];


        if (
            value === undefined
            ||
            value === null
        ) {

            continue;

        }


        const numericValue =
            Number(
                value
            );


        if (
            Number.isFinite(
                numericValue
            )
        ) {

            return numericValue;

        }

    }


    return null;

}

/* ============================================================
   CHECK FINALIZED SNAPSHOT

   A valid finalized snapshot must contain:
   - standings
   - categories
   - records
   - positive player count
   - valid category cutoff

   This also allows Admin to repair an older or
   incomplete finalized snapshot.
============================================================ */

function isFinalizedSnapshotComplete(
    snapshot
) {

    if (
        !snapshot
        ||
        typeof snapshot !==
            "object"
    ) {

        return false;

    }


    /*
       Firebase may store arrays as either
       arrays or numeric-key objects.
    */

    const standings =
        snapshot.standings;


    const hasStandings =

        (
            Array.isArray(
                standings
            )
            &&
            standings.length > 0
        )

        ||

        (
            standings
            &&
            typeof standings ===
                "object"
            &&
            Object.keys(
                standings
            ).length > 0
        );


    const hasCategories =

        snapshot.categories
        &&
        typeof snapshot.categories ===
            "object"
        &&
        snapshot.categories.category1 !==
            undefined
        &&
        snapshot.categories.category2 !==
            undefined;


    const hasRecords =

        snapshot.records
        &&
        typeof snapshot.records ===
            "object";


    const hasPlayers =

        Number(
            snapshot.playerCount
            ||
            0
        ) > 0;


    const hasValidCutoff =

        Number(
            snapshot.categoryCutoff
            ||
            0
        ) > 0;


    return (

        hasStandings
        &&
        hasCategories
        &&
        hasRecords
        &&
        hasPlayers
        &&
        hasValidCutoff

    );

}