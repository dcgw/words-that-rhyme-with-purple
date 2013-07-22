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

    function getGameElement() {
        return document.getElementsByClassName('game')[0];
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
                audio.load();
                audio.play();
            },
            stop: function () {
                audio.pause();
            }
        }
    }

    var game = (function(gameElement) {
        var gameMusic = loadSound("game-music", false);

        function start() {
            gameMusic.play();
        }

        return {
            start: start
        };
    }(getGameElement()));

    var titleScreen = (function(gameElement) {
        var titleScreenElement = document.createElement("div");

        (function() {
            var titleElement = document.createElement("h1");
            titleElement.appendChild(document.createTextNode("Words that Rhyme\xa0 with ‘Purple’\xa0"));
            titleScreenElement.appendChild(titleElement);

            titleElement.style.position = 'relative';

            var startTime = time();

            function onAnimationFrame() {
                var f = (time() - startTime) / (1000 / 60);
                titleElement.style.top = (Math.sin(f * 6 * Math.PI / 180) * 24) + 'px';
                titleElement.style.lineHeight = (96 + Math.sin(3 + f * 5 * Math.PI / 180) * 6) + 'px';
                var transform = 'scale(' + (1 + 0.1 * Math.sin(9 + f * 2 * Math.PI / 180)) + ')';
                titleElement.style.webkitTransform = transform;
                titleElement.style.mozTransform = transform;
                titleElement.style.transform = transform;
                requestAnimationFrame(onAnimationFrame);
            }

            onAnimationFrame();
        }());

        var playButton = (function () {
            var playButton = document.createElement('button');
            playButton.style.position = "relative";
            playButton.className = "play-button";
            playButton.appendChild(document.createTextNode('Play Game'));
            titleScreenElement.appendChild(playButton);

            function onClickPlay() {
                titleMusic.stop();
                letsPlaySound.play();

                playButton.disabled = true;
                playButton.className = "play-button active";

                var startTime = time();

                function onAnimationFrame() {
                    var f = (time() - startTime) / (1000 / 60);

                    playButton.style.top = Math.pow(2, f * 0.2) + 'px';
                    titleScreenElement.style.opacity = (1 - f / 45).toString();

                    if (f >= 10) {
                        playButton.className = "play-button";
                    }

                    if (++f < 45) {
                        requestAnimationFrame(onAnimationFrame);
                    } else {
                        titleScreenElement.style.display = "none";

                        game.start();
                    }
                }

                onAnimationFrame();
            }

            playButton.addEventListener("click", onClickPlay, true);

            return {
                start: function() {
                    playButton.style.top = "0";
                    playButton.disabled = false;
                }
            };
        }());

        var small = document.createElement("small");
        small.appendChild(document.createTextNode("© 2013 Smartarse Industries"));
        titleScreenElement.appendChild(small);

        while (gameElement.firstChild) {
            gameElement.removeChild(gameElement.firstChild);
        }

        gameElement.appendChild(titleScreenElement);

        var titleMusic = loadSound("title-music", true);
        var letsPlaySound = loadSound("lets-play", false);

        function start() {
            titleMusic.play();

            titleScreenElement.style.display = "block";
            titleScreenElement.style.opacity = "1";
            playButton.start();
        }

        start();

        return {
            start: start
        };
    }(getGameElement()));

    titleScreen.start();

    // Your earth-word ‘purple’ confuses and infuriates us!
    // Give us the rhymes that we demand, or be destroyed!
}());