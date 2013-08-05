(function () {
    var loadingElement = document.getElementsByClassName("loading")[0];
    loadingElement.textContent = "Loading...";


    function start() {
        var scriptElement = document.createElement("script");
        scriptElement.src = "game.js";
        document.body.appendChild(scriptElement);
    }

    if (applicationCache) {
        function onProgress(event) {
            loadingElement.textContent = "Loading... " + event.loaded.toString() + "/" + event.total.toString();
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