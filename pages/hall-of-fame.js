/* ============================================================
   FAMILY CARD LEAGUE
   HALL OF FAME PAGE

   Step 10D-1

   Responsibilities:
   01. Load players and months
   02. Collect COMPLETED games only
   03. Calculate lifetime player statistics
   04. Calculate lifetime standings
   05. Show lifetime leader cards
   06. Show lifetime standings
   07. Calculate all-time records

   Monthly champions and category achievements
   will be added later.
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

const hallLoadingState =
    document.getElementById(
        "hallLoadingState"
    );


const hallEmptyState =
    document.getElementById(
        "hallEmptyState"
    );


const hallContent =
    document.getElementById(
        "hallContent"
    );


const hallMostPointsValue =
    document.getElementById(
        "hallMostPointsValue"
    );


const hallMostPointsPlayer =
    document.getElementById(
        "hallMostPointsPlayer"
    );


const hallMostWinsValue =
    document.getElementById(
        "hallMostWinsValue"
    );


const hallMostWinsPlayer =
    document.getElementById(
        "hallMostWinsPlayer"
    );


const hallMostGamesValue =
    document.getElementById(
        "hallMostGamesValue"
    );


const hallMostGamesPlayer =
    document.getElementById(
        "hallMostGamesPlayer"
    );


const hallBestWinPercentageValue =
    document.getElementById(
        "hallBestWinPercentageValue"
    );


const hallBestWinPercentagePlayer =
    document.getElementById(
        "hallBestWinPercentagePlayer"
    );


const hallLifetimeStandings =
    document.getElementById(
        "hallLifetimeStandings"
    );


const hallMonthlyChampions =
    document.getElementById(
        "hallMonthlyChampions"
    );


const hallCategory1Leaders =
    document.getElementById(
        "hallCategory1Leaders"
    );


const hallCategory2Leaders =
    document.getElementById(
        "hallCategory2Leaders"
    );


const hallHighestMatchValue =
    document.getElementById(
        "hallHighestMatchValue"
    );


const hallHighestMatchPlayer =
    document.getElementById(
        "hallHighestMatchPlayer"
    );


const hallHighestMatchMeta =
    document.getElementById(
        "hallHighestMatchMeta"
    );


const hallLowestMatchValue =
    document.getElementById(
        "hallLowestMatchValue"
    );


const hallLowestMatchPlayer =
    document.getElementById(
        "hallLowestMatchPlayer"
    );


const hallLowestMatchMeta =
    document.getElementById(
        "hallLowestMatchMeta"
    );


const hallHighestGameValue =
    document.getElementById(
        "hallHighestGameValue"
    );


const hallHighestGamePlayer =
    document.getElementById(
        "hallHighestGamePlayer"
    );


const hallHighestGameMeta =
    document.getElementById(
        "hallHighestGameMeta"
    );


const hallLowestGameValue =
    document.getElementById(
        "hallLowestGameValue"
    );


const hallLowestGamePlayer =
    document.getElementById(
        "hallLowestGamePlayer"
    );


const hallLowestGameMeta =
    document.getElementById(
        "hallLowestGameMeta"
    );



/* ============================================================
   03. PAGE STATE
============================================================ */

let allPlayers =
    [];


let allMonths =
    [];


let allCompletedGames =
    [];


let lifetimeStandings =
    [];



/* ============================================================
   04. START PAGE
============================================================ */

loadHallOfFameData();



/* ============================================================
   05. LOAD HALL OF FAME DATA
============================================================ */

async function loadHallOfFameData() {

    try {

        const [
            playersSnapshot,
            monthsSnapshot
        ] =
        await Promise.all([

            get(
                ref(
                    database,
                    "players"
                )
            ),

            get(
                ref(
                    database,
                    "months"
                )
            )

        ]);


        allPlayers =
            snapshotToPlayers(
                playersSnapshot
            );


        allMonths =
            snapshotToMonths(
                monthsSnapshot
            );


        allCompletedGames =
            collectCompletedGames(
                allMonths
            );


        hallLoadingState.classList.add(
            "hidden"
        );


        if (
            allCompletedGames.length === 0
        ) {

            hallEmptyState.classList.remove(
                "hidden"
            );


            hallContent.classList.add(
                "hidden"
            );


            return;

        }


        hallEmptyState.classList.add(
            "hidden"
        );


        hallContent.classList.remove(
            "hidden"
        );


        lifetimeStandings =
            buildLifetimeStandings(
                allCompletedGames,
                allPlayers
            );


        renderLifetimeLeaders(
            lifetimeStandings
        );


        renderLifetimeStandings(
            lifetimeStandings
        );


        const allTimeRecords =
            buildAllTimeRecords(
                allCompletedGames,
                lifetimeStandings
            );


                renderAllTimeRecords(
            allTimeRecords
        );


        const monthlyChampions =
            buildMonthlyChampions(
                allMonths
            );


                renderMonthlyChampions(
            monthlyChampions
        );


        const categoryAchievements =
            buildCategoryAchievements(
                allMonths
            );


        renderCategoryAchievements(
            categoryAchievements
        );


        console.log(
            "Hall of Fame data loaded:",
            {
                players:
                    allPlayers.length,

                months:
                    allMonths.length,

                completedGames:
                    allCompletedGames.length,

                lifetimePlayers:
                    lifetimeStandings.length,

                allTimeRecords:
                    allTimeRecords
            }
        );

    }

    catch (error) {

        console.error(
            "Unable to load Hall of Fame data:",
            error
        );


        hallLoadingState.classList.add(
            "hidden"
        );


        hallContent.classList.add(
            "hidden"
        );


        hallEmptyState.classList.remove(
            "hidden"
        );


        const emptyTitle =
            hallEmptyState.querySelector(
                "strong"
            );


        const emptyText =
            hallEmptyState.querySelector(
                "p"
            );


        if (
            emptyTitle
        ) {

            emptyTitle.textContent =
                "Unable to load Hall of Fame";

        }


        if (
            emptyText
        ) {

            emptyText.textContent =
                "Check the Firebase connection and try again.";

        }

    }

}



/* ============================================================
   06. SNAPSHOT TO PLAYERS
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
                || {};


            players.push({

                id:
                    playerSnapshot.key,

                ...playerData

            });

        }

    );


    return players;

}



/* ============================================================
   07. SNAPSHOT TO MONTHS
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
                || {};


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
   08. COLLECT COMPLETED GAMES
============================================================ */

function collectCompletedGames(
    months
) {

    const completedGames =
        [];


    months.forEach(

        (month) => {

            const games =
                month?.games
                || {};


            Object.entries(
                games
            ).forEach(

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
                            month.id,

                        monthLabel:
                            getMonthLabel(
                                month
                            ),

                        ...game

                    });

                }

            );

        }

    );


    return completedGames;

}



/* ============================================================
   09. BUILD LIFETIME STANDINGS
============================================================ */

function buildLifetimeStandings(
    completedGames,
    players
) {

    const statistics =
        new Map();


    const playerLookup =
        new Map();


    players.forEach(

        (player) => {

            if (
                !player?.id
            ) {

                return;

            }


            playerLookup.set(

                String(
                    player.id
                ),

                String(
                    player.name
                    ||
                    "Unknown Player"
                )

            );

        }

    );


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            const winnerIds =
                getWinnerIds(
                    game
                );


            const gameTotals =
                getGameTotals(
                    game,
                    gamePlayers
                );


            gamePlayers.forEach(

                (gamePlayer) => {

                    const playerId =
                        String(
                            gamePlayer.id
                            ||
                            ""
                        );


                    if (
                        !playerId
                    ) {

                        return;

                    }


                    if (
                        !statistics.has(
                            playerId
                        )
                    ) {

                        statistics.set(

                            playerId,

                            {

                                id:
                                    playerId,

                                name:
                                    playerLookup.get(
                                        playerId
                                    )
                                    ||
                                    String(
                                        gamePlayer.name
                                        ||
                                        "Unknown Player"
                                    ),

                                gamesPlayed:
                                    0,

                                gamesWon:
                                    0,

                                totalPoints:
                                    0,

                                winPercentage:
                                    0,

                                rank:
                                    null

                            }

                        );

                    }


                    const playerStats =
                        statistics.get(
                            playerId
                        );


                    playerStats.gamesPlayed +=
                        1;


                    playerStats.totalPoints +=
                        Number(
                            gameTotals[
                                playerId
                            ]
                            ||
                            0
                        );


                    if (
                        winnerIds.includes(
                            playerId
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
            statistics.values()
        );


    standings.forEach(

        (player) => {

            player.winPercentage =
                player.gamesPlayed > 0

                    ?

                    (
                        player.gamesWon
                        /
                        player.gamesPlayed
                    )
                    *
                    100

                    :

                    0;

        }

    );


    standings.sort(
        compareLifetimeStandings
    );


    assignLifetimeRanks(
        standings
    );


    return standings;

}



/* ============================================================
   10. LIFETIME RANK COMPARISON
============================================================ */

function compareLifetimeStandings(
    playerA,
    playerB
) {

    if (
        playerB.totalPoints
        !==
        playerA.totalPoints
    ) {

        return (
            playerB.totalPoints
            -
            playerA.totalPoints
        );

    }


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


    return String(
        playerA.name
    ).localeCompare(
        String(
            playerB.name
        )
    );

}



/* ============================================================
   11. ASSIGN LIFETIME RANKS
============================================================ */

function assignLifetimeRanks(
    standings
) {

    let previousPlayer =
        null;


    standings.forEach(

        (player, index) => {

            if (
                previousPlayer
                &&
                haveSameLifetimeRankingValues(
                    previousPlayer,
                    player
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
   12. SAME RANK VALUES
============================================================ */

function haveSameLifetimeRankingValues(
    playerA,
    playerB
) {

    return (

        playerA.totalPoints
            ===
        playerB.totalPoints

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
   13. RENDER LIFETIME LEADERS
============================================================ */

function renderLifetimeLeaders(
    standings
) {

    if (
        standings.length === 0
    ) {

        return;

    }


    const mostPoints =
        findTopPlayers(
            standings,
            "totalPoints"
        );


    hallMostPointsValue.textContent =
        formatNumber(
            mostPoints.value
        );


    hallMostPointsPlayer.textContent =
        joinPlayerNames(
            mostPoints.players
        );


    const mostWins =
        findTopPlayers(
            standings,
            "gamesWon"
        );


    hallMostWinsValue.textContent =
        formatNumber(
            mostWins.value
        );


    hallMostWinsPlayer.textContent =
        joinPlayerNames(
            mostWins.players
        );


    const mostGames =
        findTopPlayers(
            standings,
            "gamesPlayed"
        );


    hallMostGamesValue.textContent =
        formatNumber(
            mostGames.value
        );


    hallMostGamesPlayer.textContent =
        joinPlayerNames(
            mostGames.players
        );


        /*
       BEST LIFETIME WIN %

       Eligibility:
       Minimum 5 completed games.

       Tie-break:
       1. Higher Win %
       2. More Games Won
       3. More Games Played
       4. Alphabetical display order
    */

    const bestWinPercentage =
        findBestWinPercentage(
            standings,
            5
        );


    if (
        !bestWinPercentage
    ) {

        hallBestWinPercentageValue.textContent =
            "—";


        hallBestWinPercentagePlayer.textContent =
            "Minimum 5 games required";

    }

    else {

        hallBestWinPercentageValue.textContent =
            formatWinPercentage(
                bestWinPercentage.winPercentage
            );


        hallBestWinPercentagePlayer.textContent =
            joinPlayerNames(
                bestWinPercentage.players
            );

    }

}



/* ============================================================
   14. FIND TOP PLAYERS
============================================================ */

function findTopPlayers(
    standings,
    field
) {

    if (
        standings.length === 0
    ) {

        return {

            value:
                0,

            players:
                []

        };

    }


    let highestValue =
        null;


    standings.forEach(

        (player) => {

            const value =
                Number(
                    player[
                        field
                    ]
                    ||
                    0
                );


            if (
                highestValue === null
                ||
                value > highestValue
            ) {

                highestValue =
                    value;

            }

        }

    );


    const players =
        standings.filter(

            (player) =>

                Number(
                    player[
                        field
                    ]
                    ||
                    0
                )
                ===
                highestValue

        );


    return {

        value:
            highestValue
            ??
            0,

        players:
            players

    };

}



/* ============================================================
   15. RENDER LIFETIME STANDINGS
============================================================ */

function renderLifetimeStandings(
    standings
) {

    hallLifetimeStandings.innerHTML =
        "";


    standings.forEach(

        (player) => {

            const row =
                document.createElement(
                    "article"
                );


            row.className =
                "hall-lifetime-row";


            row.innerHTML =
                `
                    <div class="hall-lifetime-row-top">

                        <span class="hall-lifetime-player">
                            ${escapeHtml(
                                player.name
                            )}
                        </span>

                        <span class="hall-lifetime-rank">
                            #${player.rank}
                        </span>

                    </div>


                    <div class="hall-lifetime-stats">

                        <div class="hall-lifetime-stat">

                            <strong>
                                ${formatNumber(
                                    player.gamesPlayed
                                )}
                            </strong>

                            <span>
                                Games
                            </span>

                        </div>


                        <div class="hall-lifetime-stat">

                            <strong>
                                ${formatNumber(
                                    player.gamesWon
                                )}
                            </strong>

                            <span>
                                Wins
                            </span>

                        </div>


                        <div class="hall-lifetime-stat">

                            <strong>
                                ${formatWinPercentage(
                                    player.winPercentage
                                )}
                            </strong>

                            <span>
                                Win %
                            </span>

                        </div>


                        <div class="hall-lifetime-stat">

                            <strong>
                                ${formatNumber(
                                    player.totalPoints
                                )}
                            </strong>

                            <span>
                                Points
                            </span>

                        </div>

                    </div>
                `;


            hallLifetimeStandings.appendChild(
                row
            );

        }

    );

}



/* ============================================================
   16. BUILD ALL-TIME RECORDS
============================================================ */

function buildAllTimeRecords(
    completedGames,
    standings
) {

    const standingLookup =
        new Map();


    standings.forEach(

        (player) => {

            standingLookup.set(
                String(
                    player.id
                ),
                player
            );

        }

    );


    const highestMatchCandidates =
        [];


    const lowestMatchCandidates =
        [];


    const highestGameCandidates =
        [];


    const lowestGameCandidates =
        [];


    completedGames.forEach(

        (game) => {

            const gamePlayers =
                getGamePlayers(
                    game
                );


            const gameTotals =
                getGameTotals(
                    game,
                    gamePlayers
                );


            const matches =
                getGameMatches(
                    game
                );


            gamePlayers.forEach(

                (player) => {

                    const playerId =
                        String(
                            player.id
                        );


                    const totalScore =
                        Number(
                            gameTotals[
                                playerId
                            ]
                            ||
                            0
                        );


                    const gameCandidate =
                        createRecordCandidate({

                            playerId:
                                playerId,

                            playerName:
                                player.name,

                            score:
                                totalScore,

                            game:
                                game,

                            matchNumber:
                                null,

                            standing:
                                standingLookup.get(
                                    playerId
                                )

                        });


                    highestGameCandidates.push(
                        gameCandidate
                    );


                    lowestGameCandidates.push(
                        gameCandidate
                    );

                }

            );


            matches.forEach(

                (matchEntry) => {

                    gamePlayers.forEach(

                        (player) => {

                            const playerId =
                                String(
                                    player.id
                                );


                            const score =
                                getMatchScore(
                                    matchEntry.data,
                                    playerId
                                );


                            const matchCandidate =
                                createRecordCandidate({

                                    playerId:
                                        playerId,

                                    playerName:
                                        player.name,

                                    score:
                                        score,

                                    game:
                                        game,

                                    matchNumber:
                                        matchEntry.number,

                                    standing:
                                        standingLookup.get(
                                            playerId
                                        )

                                });


                            highestMatchCandidates.push(
                                matchCandidate
                            );


                            lowestMatchCandidates.push(
                                matchCandidate
                            );

                        }

                    );

                }

            );

        }

    );


    return {

        highestMatch:
            chooseRecordCandidate(
                highestMatchCandidates,
                "HIGH"
            ),

        lowestMatch:
            chooseRecordCandidate(
                lowestMatchCandidates,
                "LOW"
            ),

        highestGame:
            chooseRecordCandidate(
                highestGameCandidates,
                "HIGH"
            ),

        lowestGame:
            chooseRecordCandidate(
                lowestGameCandidates,
                "LOW"
            )

    };

}



/* ============================================================
   17. CREATE RECORD CANDIDATE
============================================================ */

function createRecordCandidate(
    options
) {

    return {

        playerId:
            options.playerId,

        playerName:
            String(
                options.playerName
                ||
                "Unknown Player"
            ),

        score:
            Number(
                options.score
                ||
                0
            ),

        monthId:
            options.game.monthId,

        monthLabel:
            options.game.monthLabel,

        gameNumber:
            Number(
                options.game.gameNumber
                ||
                0
            ),

        matchNumber:
            options.matchNumber,

        completedAt:
            Number(
                options.game.completedAt
                ||
                options.game.createdAt
                ||
                0
            ),

        winPercentage:
            Number(
                options.standing?.winPercentage
                ||
                0
            ),

        gamesWon:
            Number(
                options.standing?.gamesWon
                ||
                0
            )

    };

}



/* ============================================================
   18. CHOOSE RECORD CANDIDATE
============================================================ */

function chooseRecordCandidate(
    candidates,
    direction
) {

    if (
        candidates.length === 0
    ) {

        return null;

    }


    const sorted =
        [...candidates];


    sorted.sort(

        (candidateA, candidateB) => {

            if (
                candidateA.score
                !==
                candidateB.score
            ) {

                if (
                    direction ===
                    "HIGH"
                ) {

                    return (
                        candidateB.score
                        -
                        candidateA.score
                    );

                }


                return (
                    candidateA.score
                    -
                    candidateB.score
                );

            }


            return chooseRecordTieBreaker(
                candidateA,
                candidateB
            );

        }

    );


    return sorted[0];

}



/* ============================================================
   19. RECORD TIE-BREAK
============================================================ */

function chooseRecordTieBreaker(
    candidateA,
    candidateB
) {

    if (
        candidateB.winPercentage
        !==
        candidateA.winPercentage
    ) {

        return (
            candidateB.winPercentage
            -
            candidateA.winPercentage
        );

    }


    if (
        candidateB.gamesWon
        !==
        candidateA.gamesWon
    ) {

        return (
            candidateB.gamesWon
            -
            candidateA.gamesWon
        );

    }


    return String(
        candidateA.playerName
    ).localeCompare(
        String(
            candidateB.playerName
        )
    );

}



/* ============================================================
   20. RENDER ALL-TIME RECORDS
============================================================ */

function renderAllTimeRecords(
    records
) {

    renderRecord(

        records.highestMatch,

        hallHighestMatchValue,
        hallHighestMatchPlayer,
        hallHighestMatchMeta,
        true

    );


    renderRecord(

        records.lowestMatch,

        hallLowestMatchValue,
        hallLowestMatchPlayer,
        hallLowestMatchMeta,
        true

    );


    renderRecord(

        records.highestGame,

        hallHighestGameValue,
        hallHighestGamePlayer,
        hallHighestGameMeta,
        false

    );


    renderRecord(

        records.lowestGame,

        hallLowestGameValue,
        hallLowestGamePlayer,
        hallLowestGameMeta,
        false

    );

}



/* ============================================================
   21. RENDER SINGLE RECORD
============================================================ */

function renderRecord(
    record,
    valueElement,
    playerElement,
    metaElement,
    includeMatchNumber
) {

    if (
        !record
    ) {

        valueElement.textContent =
            "—";


        playerElement.textContent =
            "—";


        metaElement.textContent =
            "—";


        return;

    }


    valueElement.textContent =
        formatNumber(
            record.score
        );


    playerElement.textContent =
        record.playerName;


    let metaText =
        `${record.monthLabel} • Game #${record.gameNumber}`;


    if (
        includeMatchNumber
        &&
        record.matchNumber !== null
    ) {

        metaText +=
            ` • Match ${record.matchNumber}`;

    }


    const dateText =
        formatRecordDate(
            record.completedAt
        );


    if (
        dateText
    ) {

        metaText +=
            ` • ${dateText}`;

    }


    metaElement.textContent =
        metaText;

}



/* ============================================================
   22. GET GAME MATCHES
============================================================ */

function getGameMatches(
    game
) {

    const matches =
        game?.matches
        ||
        {};


    return Object.entries(
        matches
    )
    .map(

        ([key, value]) => {

            let matchNumber =
                Number(
                    key
                );


            if (
                value?.matchNumber !==
                undefined
            ) {

                matchNumber =
                    Number(
                        value.matchNumber
                    );

            }


            return {

                number:
                    matchNumber,

                data:
                    value

            };

        }

    )
    .filter(

        (match) =>

            match.data
            &&
            Number.isFinite(
                match.number
            )

    );

}



/* ============================================================
   23. GET PLAYERS FROM GAME
============================================================ */

function getGamePlayers(
    game
) {

    const players =
        game?.players;


    if (
        Array.isArray(
            players
        )
    ) {

        return players
            .filter(
                Boolean
            )
            .map(
                normalizeGamePlayer
            );

    }


    if (
        players
        &&
        typeof players ===
        "object"
    ) {

        return Object.entries(
            players
        )
        .filter(
            ([, player]) =>
                Boolean(
                    player
                )
        )
        .map(

            ([key, player]) => {

                const normalized =
                    normalizeGamePlayer(
                        player
                    );


                if (
                    !normalized.id
                ) {

                    normalized.id =
                        String(
                            key
                        );

                }


                return normalized;

            }

        );

    }


    return [];

}



/* ============================================================
   24. NORMALIZE GAME PLAYER
============================================================ */

function normalizeGamePlayer(
    player
) {

    if (
        !player
        ||
        typeof player !==
        "object"
    ) {

        return {

            id:
                "",

            name:
                "Unknown Player"

        };

    }


    return {

        ...player,

        id:
            String(
                player.id
                ||
                player.playerId
                ||
                player.uid
                ||
                ""
            ),

        name:
            String(
                player.name
                ||
                player.playerName
                ||
                "Unknown Player"
            )

    };

}



/* ============================================================
   25. GET GAME TOTALS
============================================================ */

function getGameTotals(
    game,
    gamePlayers
) {

    const totals =
        {};


    gamePlayers.forEach(

        (player) => {

            totals[
                String(
                    player.id
                )
            ] =
                0;

        }

    );


    if (
        game?.finalTotals
        &&
        typeof game.finalTotals ===
        "object"
    ) {

        Object.entries(
            game.finalTotals
        ).forEach(

            ([playerId, score]) => {

                totals[
                    String(
                        playerId
                    )
                ] =
                    Number(
                        score
                        ||
                        0
                    );

            }

        );


        return totals;

    }


    const matches =
        game?.matches
        ||
        {};


    Object.values(
        matches
    ).forEach(

        (match) => {

            gamePlayers.forEach(

                (player) => {

                    const playerId =
                        String(
                            player.id
                        );


                    totals[
                        playerId
                    ] +=
                        getMatchScore(
                            match,
                            playerId
                        );

                }

            );

        }

    );


    return totals;

}



/* ============================================================
   26. GET MATCH SCORE
============================================================ */

function getMatchScore(
    match,
    playerId
) {

    if (
        !match
    ) {

        return 0;

    }


    if (
        match.scores
        &&
        typeof match.scores ===
        "object"
        &&
        match.scores[
            playerId
        ]
        !==
        undefined
    ) {

        const value =
            match.scores[
                playerId
            ];


        if (
            typeof value ===
            "object"
            &&
            value !== null
        ) {

            return Number(
                value.score
                ??
                value.value
                ??
                0
            );

        }


        return Number(
            value
            ||
            0
        );

    }


    if (
        match[
            playerId
        ]
        !==
        undefined
    ) {

        const value =
            match[
                playerId
            ];


        if (
            typeof value ===
            "object"
            &&
            value !== null
        ) {

            return Number(
                value.score
                ??
                value.value
                ??
                0
            );

        }


        return Number(
            value
            ||
            0
        );

    }


    return 0;

}



/* ============================================================
   27. GET WINNER IDS
============================================================ */

function getWinnerIds(
    game
) {

    const winners =
        game?.winners;


    if (
        Array.isArray(
            winners
        )
    ) {

        return winners
            .map(

                (winner) => {

                    if (
                        winner
                        &&
                        typeof winner ===
                        "object"
                    ) {

                        return String(
                            winner.id
                            ||
                            winner.playerId
                            ||
                            winner.uid
                            ||
                            ""
                        );

                    }


                    return String(
                        winner
                        ||
                        ""
                    );

                }

            )
            .filter(
                Boolean
            );

    }


    if (
        winners
        &&
        typeof winners ===
        "object"
    ) {

        return Object.entries(
            winners
        )
        .filter(

            ([, value]) =>

                value === true

                ||

                typeof value ===
                "string"

                ||

                typeof value ===
                "object"

        )
        .map(

            ([key, value]) => {

                if (
                    value
                    &&
                    typeof value ===
                    "object"
                ) {

                    return String(
                        value.id
                        ||
                        value.playerId
                        ||
                        key
                    );

                }


                if (
                    typeof value ===
                    "string"
                    &&
                    value
                ) {

                    return String(
                        value
                    );

                }


                return String(
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
   28. FORMAT RECORD DATE
============================================================ */

function formatRecordDate(
    timestamp
) {

    const number =
        Number(
            timestamp
            ||
            0
        );


    if (
        !number
    ) {

        return "";

    }


    const date =
        new Date(
            number
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
   29. JOIN PLAYER NAMES
============================================================ */

function joinPlayerNames(
    players
) {

    if (
        !players
        ||
        players.length === 0
    ) {

        return "—";

    }


    return players
        .map(
            (player) =>
                player.name
        )
        .join(
            " / "
        );

}



/* ============================================================
   30. GET MONTH LABEL
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
   31. BUILD MONTH LABEL
============================================================ */

function buildMonthLabel(
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
   32. FORMAT WIN %
============================================================ */

function formatWinPercentage(
    value
) {

    const number =
        Number(
            value
            ||
            0
        );


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
   33. FORMAT NUMBER
============================================================ */

function formatNumber(
    value
) {

    return Number(
        value
        ||
        0
    ).toLocaleString(
        "en-US"
    );

}



/* ============================================================
   34. ESCAPE HTML
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
   35. BUILD MONTHLY CHAMPIONS

   IMPORTANT:

   Only FINALIZED months can produce
   official monthly champions.

   ACTIVE months are deliberately ignored.

   The champion information is read from the
   frozen finalizedSnapshot that will be created
   by the Admin month-finalization system later.
============================================================ */

function buildMonthlyChampions(
    months
) {

    const champions =
        [];


    months.forEach(

        (month) => {

            const status =
                String(
                    month?.info?.status
                    ||
                    month?.status
                    ||
                    ""
                ).toUpperCase();


            /*
               Never award an active month.
            */

            if (
                status !==
                "FINALIZED"
            ) {

                return;

            }


            const snapshot =
                month?.finalizedSnapshot;


            if (
                !snapshot
            ) {

                return;

            }


            const standings =
                normalizeFinalizedStandings(
                    snapshot.standings
                );


            if (
                standings.length === 0
            ) {

                return;

            }


            /*
               Competition ranking means more than one
               player may officially finish Rank #1.
            */

            const winners =
                standings.filter(

                    (player) =>

                        Number(
                            player.rank
                            ||
                            0
                        )
                        ===
                        1

                );


            if (
                winners.length === 0
            ) {

                return;

            }


            champions.push({

                monthId:
                    month.id,

                monthLabel:
                    getMonthLabel(
                        month
                    ),

                finalizedAt:
                    Number(
                        snapshot.finalizedAt
                        ||
                        month?.info?.finalizedAt
                        ||
                        0
                    ),

                winners:
                    winners

            });

        }

    );


    /*
       Newest finalized month first.
    */

    champions.sort(

        (championA, championB) =>

            String(
                championB.monthId
            ).localeCompare(
                String(
                    championA.monthId
                )
            )

    );


    return champions;

}



/* ============================================================
   36. NORMALIZE FINALIZED STANDINGS

   Supports either:
   - array
   - Firebase object
============================================================ */

function normalizeFinalizedStandings(
    standings
) {

    if (
        Array.isArray(
            standings
        )
    ) {

        return standings.filter(
            Boolean
        );

    }


    if (
        standings
        &&
        typeof standings ===
        "object"
    ) {

        return Object.values(
            standings
        ).filter(
            Boolean
        );

    }


    return [];

}



/* ============================================================
   37. RENDER MONTHLY CHAMPIONS
============================================================ */

function renderMonthlyChampions(
    champions
) {

    hallMonthlyChampions.innerHTML =
        "";


    if (
        champions.length === 0
    ) {

        hallMonthlyChampions.innerHTML =
            `
                <div class="hall-empty-list">

                    No finalized monthly champions yet.

                </div>
            `;


        return;

    }


    champions.forEach(

        (month) => {

            month.winners.forEach(

                (winner) => {

                    const row =
                        createMonthlyChampionRow(
                            month,
                            winner
                        );


                    hallMonthlyChampions.appendChild(
                        row
                    );

                }

            );

        }

    );

}



/* ============================================================
   38. CREATE MONTHLY CHAMPION ROW
============================================================ */

function createMonthlyChampionRow(
    month,
    winner
) {

    const row =
        document.createElement(
            "article"
        );


    row.className =
        "hall-champion-row";


    const playerName =
        String(
            winner.name
            ||
            winner.playerName
            ||
            "Unknown Player"
        );


    const points =
        Number(
            winner.totalPoints
            ??
            winner.points
            ??
            0
        );


    row.innerHTML =
        `
            <div class="hall-champion-info">

                <span class="hall-champion-month">
                    ${escapeHtml(
                        month.monthLabel
                    )}
                </span>

                <strong class="hall-champion-name">
                    ★ ${escapeHtml(
                        playerName
                    )}
                </strong>

            </div>


            <div class="hall-champion-points">

                <strong>
                    ${formatNumber(
                        points
                    )}
                </strong>

                <span>
                    Points
                </span>

            </div>
        `;


    return row;

}

/* ============================================================
   39. BUILD CATEGORY ACHIEVEMENTS

   Only FINALIZED months count.

   Each player receives one Category 1 or
   Category 2 first-place achievement for
   every finalized month in which they
   finished Rank #1 in that category.

   Joint Rank #1 players each receive
   one achievement.
============================================================ */

function buildCategoryAchievements(
    months
) {

    const category1Wins =
        new Map();


    const category2Wins =
        new Map();


    months.forEach(

        (month) => {

            const status =
                String(
                    month?.info?.status
                    ||
                    month?.status
                    ||
                    ""
                ).toUpperCase();


            if (
                status !==
                "FINALIZED"
            ) {

                return;

            }


            const snapshot =
                month?.finalizedSnapshot;


            if (
                !snapshot
            ) {

                return;

            }


            const category1 =
                getFinalizedCategoryStandings(
                    snapshot,
                    "category1"
                );


            const category2 =
                getFinalizedCategoryStandings(
                    snapshot,
                    "category2"
                );


            addCategoryFirstPlaces(
                category1,
                category1Wins
            );


            addCategoryFirstPlaces(
                category2,
                category2Wins
            );

        }

    );


    return {

        category1:
            convertCategoryMapToArray(
                category1Wins
            ),

        category2:
            convertCategoryMapToArray(
                category2Wins
            )

    };

}



/* ============================================================
   40. GET FINALIZED CATEGORY STANDINGS

   Supports a few sensible finalized snapshot layouts:

   finalizedSnapshot.categories.category1
   finalizedSnapshot.category1
============================================================ */

function getFinalizedCategoryStandings(
    snapshot,
    categoryKey
) {

    const source =
        snapshot?.categories?.[
            categoryKey
        ]
        ??
        snapshot?.[
            categoryKey
        ]
        ??
        null;


    return normalizeFinalizedStandings(
        source
    );

}



/* ============================================================
   41. ADD CATEGORY FIRST PLACES
============================================================ */

function addCategoryFirstPlaces(
    standings,
    resultMap
) {

    standings.forEach(

        (player) => {

            const rank =
                Number(
                    player.rank
                    ||
                    0
                );


            if (
                rank !== 1
            ) {

                return;

            }


            const playerId =
                String(
                    player.id
                    ||
                    player.playerId
                    ||
                    player.uid
                    ||
                    player.name
                    ||
                    player.playerName
                    ||
                    ""
                );


            if (
                !playerId
            ) {

                return;

            }


            const playerName =
                String(
                    player.name
                    ||
                    player.playerName
                    ||
                    "Unknown Player"
                );


            if (
                !resultMap.has(
                    playerId
                )
            ) {

                resultMap.set(

                    playerId,

                    {

                        id:
                            playerId,

                        name:
                            playerName,

                        firstPlaces:
                            0

                    }

                );

            }


            resultMap.get(
                playerId
            ).firstPlaces +=
                1;

        }

    );

}



/* ============================================================
   42. CONVERT CATEGORY MAP TO ARRAY
============================================================ */

function convertCategoryMapToArray(
    resultMap
) {

    const results =
        Array.from(
            resultMap.values()
        );


    results.sort(

        (playerA, playerB) => {

            if (
                playerB.firstPlaces
                !==
                playerA.firstPlaces
            ) {

                return (
                    playerB.firstPlaces
                    -
                    playerA.firstPlaces
                );

            }


            return String(
                playerA.name
            ).localeCompare(
                String(
                    playerB.name
                )
            );

        }

    );


    return results;

}



/* ============================================================
   43. RENDER CATEGORY ACHIEVEMENTS
============================================================ */

function renderCategoryAchievements(
    achievements
) {

    renderCategoryAchievementList(

        hallCategory1Leaders,

        achievements.category1,

        "No finalized Category 1 winners yet."

    );


    renderCategoryAchievementList(

        hallCategory2Leaders,

        achievements.category2,

        "No finalized Category 2 winners yet."

    );

}



/* ============================================================
   44. RENDER CATEGORY ACHIEVEMENT LIST
============================================================ */

function renderCategoryAchievementList(
    container,
    players,
    emptyMessage
) {

    container.innerHTML =
        "";


    if (
        players.length === 0
    ) {

        container.innerHTML =
            `
                <div class="hall-empty-list">

                    ${escapeHtml(
                        emptyMessage
                    )}

                </div>
            `;


        return;

    }


    players.forEach(

        (player) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "hall-category-row";


            row.innerHTML =
                `
                    <span>
                        ${escapeHtml(
                            player.name
                        )}
                    </span>

                    <strong>
                        ${formatNumber(
                            player.firstPlaces
                        )}
                    </strong>
                `;


            container.appendChild(
                row
            );

        }

    );

}

/* ============================================================
   45. FIND BEST LIFETIME WIN PERCENTAGE

   Eligibility:
   Minimum completed games = 5

   Tie-break:
   1. Highest Win %
   2. More Games Won
   3. More Games Played
   4. Alphabetical display order

   Exact ties remain joint leaders.
============================================================ */

function findBestWinPercentage(
    standings,
    minimumGames
) {

    const eligiblePlayers =
        standings.filter(

            (player) =>

                Number(
                    player.gamesPlayed
                    ||
                    0
                )
                >=
                minimumGames

        );


    if (
        eligiblePlayers.length === 0
    ) {

        return null;

    }


    const sorted =
        [...eligiblePlayers];


    sorted.sort(

        (playerA, playerB) => {

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


            if (
                playerB.gamesPlayed
                !==
                playerA.gamesPlayed
            ) {

                return (
                    playerB.gamesPlayed
                    -
                    playerA.gamesPlayed
                );

            }


            return String(
                playerA.name
            ).localeCompare(
                String(
                    playerB.name
                )
            );

        }

    );


    const topPlayer =
        sorted[0];


    const jointLeaders =
        sorted.filter(

            (player) =>

                player.winPercentage
                    ===
                topPlayer.winPercentage

                &&

                player.gamesWon
                    ===
                topPlayer.gamesWon

                &&

                player.gamesPlayed
                    ===
                topPlayer.gamesPlayed

        );


    return {

        winPercentage:
            topPlayer.winPercentage,

        players:
            jointLeaders

    };

}