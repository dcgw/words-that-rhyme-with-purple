(function () {
    var loadingElement = document.getElementsByClassName("loading")[0];
    loadingElement.textContent = "Loading...";


    function start() {
        var scriptElement = document.createElement("script");
        scriptElement.src = "game.js";
        document.body.appendChild(scriptElement);
    }

    if (window.applicationCache &&
            // Fuck Firefox in the eye.
            !/mozilla(?!.*webkit).*\Wgecko\W/i.test(window.navigator && navigator.userAgent || "")) {
        function onProgress(event) {
            if (typeof event.loaded === "number" && typeof event.total === "number") {
                loadingElement.textContent = "Loading... " + event.loaded.toString() + "/" + event.total.toString();
            }
        }

        function onUpdateReady() {
            window.location.reload();
        }

        applicationCache.addEventListener("progress", onProgress, true);
        applicationCache.addEventListener("noupdate", start, true);
        applicationCache.addEventListener("cached", start, true);
        applicationCache.addEventListener("updateready", onUpdateReady, true);
        applicationCache.addEventListener("obsolete", start, true);
        applicationCache.addEventListener("error", start, true);
    } else {
        start();
    }
}());