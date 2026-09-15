/* ============================================================
   FAMILY CARD LEAGUE
   SERVICE WORKER

   Version 1
============================================================ */

const CACHE_NAME =
    "family-card-league-v2";


/*
   Only cache the basic app shell.

   Firebase data is NOT cached here.
*/

const APP_SHELL = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./firebase-config.js",

    "./manifest.json",

    "./assets/icon-192.png",

    "./assets/icon-512.png"

];


/* ============================================================
   INSTALL
============================================================ */

self.addEventListener(

    "install",

    (event) => {

        event.waitUntil(

            caches
                .open(
                    CACHE_NAME
                )
                .then(

                    (cache) => {

                        return cache.addAll(
                            APP_SHELL
                        );

                    }

                )

        );


        self.skipWaiting();

    }

);


/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener(

    "activate",

    (event) => {

        event.waitUntil(

            caches
                .keys()
                .then(

                    (cacheNames) => {

                        return Promise.all(

                            cacheNames
                                .filter(

                                    (cacheName) =>

                                        cacheName !==
                                        CACHE_NAME

                                )
                                .map(

                                    (cacheName) =>

                                        caches.delete(
                                            cacheName
                                        )

                                )

                        );

                    }

                )

        );


        self.clients.claim();

    }

);


/* ============================================================
   FETCH

   Network first.

   This is important for the portal because we want the newest
   HTML / JS / CSS whenever internet access is available.

   Cache is only used as a fallback.
============================================================ */

self.addEventListener(

    "fetch",

    (event) => {

        /*
           Only handle normal GET requests.
        */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
           Do not interfere with Firebase,
           Google APIs or other external requests.
        */

        const requestUrl =
            new URL(
                event.request.url
            );


        if (
            requestUrl.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            fetch(
                event.request
            )
            .then(

                (networkResponse) => {

                    /*
                       Save a fresh copy of successful
                       same-origin responses.
                    */

                    if (
                        networkResponse
                        &&
                        networkResponse.ok
                    ) {

                        const responseCopy =
                            networkResponse.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(

                                (cache) => {

                                    cache.put(

                                        event.request,
                                        responseCopy

                                    );

                                }

                            );

                    }


                    return networkResponse;

                }

            )
            .catch(

                async () => {

                    const cachedResponse =
                        await caches.match(
                            event.request
                        );


                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    /*
                       If a page itself is unavailable,
                       fall back to the dashboard.
                    */

                    if (
                        event.request.mode ===
                        "navigate"
                    ) {

                        return caches.match(
                            "./index.html"
                        );

                    }


                    return Response.error();

                }

            )

        );

    }

);