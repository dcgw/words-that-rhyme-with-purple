(function () {
    var console = window.console;
    if (!console) {
        console = {
            log: function () {
            },
            error: function () {
            }
        }
    }

    var time = (function () {
        if (Date.now) {
            return Date.now;
        } else {
            return function () {
                return +new Date();
            };
        }
    }());

    var requestAnimationFrame;
    var cancelAnimationFrame;
    (function () {
        if (window.requestAnimationFrame) {
            requestAnimationFrame = window.requestAnimationFrame;
            cancelAnimationFrame = window.cancelAnimationFrame;
        } else if (window.mozRequestAnimationFrame) {
            requestAnimationFrame = window.mozRequestAnimationFrame;
            cancelAnimationFrame = window.mozCancelAnimationFrame;
        } else if (window.webkitRequestAnimationFrame) {
            requestAnimationFrame = window.webkitRequestAnimationFrame;
            cancelAnimationFrame = window.webkitCancelAnimationFrame;
        } else if (window.oRequestAnimationFrame) {
            requestAnimationFrame = window.oRequestAnimationFrame;
            cancelAnimationFrame = window.oCancelAnimationFrame;
        } else {
            var interval = 1000 / 60;
            var cancelAfterNothingTimes = 60;
            var nothingTimes = 0;
            var intervalId;
            var callbacksA = [];
            var callbacksB = [];

            function onInterval() {
                var now = time();
                var callbacks = callbacksA;
                callbacksA = callbacksB;
                callbacksB = callbacks;

                if (callbacks.length == 0) {
                    if (++nothingTimes >= cancelAfterNothingTimes) {
                        nothingTimes = 0;
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                } else {
                    nothingTimes = 0;

                    for (var i = 0; i < callbacks.length; ++i) {
                        var callback = callbacks[i];
                        if (callback) {
                            try {
                                callback(now);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }

                callbacks.length = 0;
            }

            requestAnimationFrame = function (callback) {
                if (!intervalId) {
                    intervalId = setInterval(onInterval, interval);
                }

                var id = callbacksA.length;
                callbacksA.push(callback);
                return id;
            };

            cancelAnimationFrame = function (id) {
                callbacksA[id] = null;
            };
        }
    }());

    function getGame() {
        return document.getElementsByClassName('game')[0];
    }

    function getTitle() {
        return document.getElementsByTagName('h1')[0];
    }

    function getSmallPrint() {
        return document.getElementsByTagName('small')[0];
    }

    function loadSound(name, loop) {
        var audio = document.createElement("audio");
        var source = document.createElement("source");
        source.src = name + ".ogg";
        audio.appendChild(source);
        source = document.createElement("source");
        source.src = name + ".mp3";
        audio.appendChild(source);
        audio.loop = !!loop;
        return {
            play: function () {
                audio.play();
            },
            stop: function () {
                audio.pause();
            }
        }
    }

    var titleMusic = loadSound("title-music", true);
    var letsPlaySound = loadSound("lets-play", false);
    var gameMusic = loadSound("game-music", false);

    titleMusic.play();

    (function (game, title, smallPrint) {
        var playButton = document.createElement('button');
        playButton.style.position = "relative";
        playButton.addEventListener("click", onClick, true);
        playButton.className = "play-button";
        playButton.appendChild(document.createTextNode('Play Game'));
        game.insertBefore(playButton, smallPrint);

        function onClick() {
            titleMusic.stop();
            letsPlaySound.play();

            playButton.disabled = true;
            playButton.className = "play-button active";

            var startTime = time();

            function onAnimationFrame() {
                var f = (time() - startTime) / (1000 / 60);

                playButton.style.top = Math.pow(2, f * 0.2) + 'px';
                title.style.opacity = smallPrint.style.opacity = (1 - f / 30).toString();

                if (f >= 10) {
                    playButton.className = "play-button";
                }

                if (++f < 45) {
                    requestAnimationFrame(onAnimationFrame);
                } else {
                    title.style.display = "none";
                    smallPrint.style.display = "none";
                    playButton.style.display = "none";

                    gameMusic.play();
                }
            }

            onAnimationFrame();
        }
    }(getGame(), getTitle(), getSmallPrint()));

    (function (title) {
        title.style.position = 'relative';

        var startTime = time();

        function onAnimationFrame() {
            var f = (time() - startTime) / (1000 / 60);
            title.style.top = (Math.sin(f * 6 * Math.PI / 180) * 24) + 'px';
            title.style.lineHeight = (96 + Math.sin(3 + f * 5 * Math.PI / 180) * 6) + 'px';
            var transform = 'scale(' + (1 + 0.1 * Math.sin(9 + f * 2 * Math.PI / 180)) + ')';
            title.style.webkitTransform = transform;
            title.style.mozTransform = transform;
            title.style.transform = transform;
            requestAnimationFrame(onAnimationFrame);
        }

        onAnimationFrame();
    }(getTitle()));

    // Your earth-word ‘purple’ confuses and infuriates us!
    // Give us the rhymes that we demand, or be destroyed!
}());