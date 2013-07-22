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

    var mainElement = (function() {
        var mainElement = document.getElementsByClassName('words-purple')[0];

        while (mainElement.firstChild) {
            mainElement.removeChild(mainElement.firstChild);
        }

        return mainElement;
    }());

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

    var game = (function() {
        var gameElement = document.createElement("div");
        gameElement.style.display = "none";
        gameElement.style.width = "100%";
        gameElement.style.height = "100%";

        var counter = (function() {
            var counterElement = document.createElement("div");
            counterElement.className = "counter";
            gameElement.appendChild(counterElement);

            function start() {
                var startTime = time();

                function onAnimationFrame() {
                    var seconds = (time() - startTime) / 1000;

                    if (seconds < 11) {
                        counterElement.textContent = Math.ceil(10 - seconds).toString();
                        counterElement.style.opacity = 1 - (seconds % 1);

                        requestAnimationFrame(onAnimationFrame);
                    } else {
                        gameElement.style.display = "none";
                        titleScreen.start();
                    }
                }

                onAnimationFrame();
            }

            return {
                start: start
            };
        }());

        (function() {
            var instruction = document.createElement("div");
            instruction.className = "instruction";
            instruction.appendChild(document.createTextNode("Write down as many words as you can that rhyme with ‘purple’!!!!!"));
            gameElement.appendChild(instruction);

            setInterval(function() {
                instruction.style.paddingTop = (Math.random() * 32) + "px";
                instruction.style.textIndent = (Math.random() * 128) + "px";
                instruction.style.fontSize = (Math.random() * 16 - 8 + 32) + "px";
                instruction.style.lineHeight = (Math.random() * 16 - 8 + 48) + "px";
            }, 500);

            setInterval(function() {
                instruction.style.color = "hsl(" + (Math.random() * 80 + 245) + ",50%,40%)";
            }, 1000/6)
        }());

        var wordEntry = (function() {
            var allowedWords = {
                "curple": true,
                "hirple": true
            };

            var wordEntry = document.createElement("div");
            wordEntry.className = "word-entry";

            var input = document.createElement("input");
            wordEntry.appendChild(input);

            function onInputChange(event) {
                setTimeout(function () {
                    if (event.key === "Enter" ||
                            event.charCode === 0xa ||
                            event.charCode === 0xd ||
                            event.keyCode === 0xa ||
                            event.keyCode === 0xd ||
                            event.which === 0xa ||
                            event.which === 0xd ||
                            /\s/.test(input.value)) {
                        var words = input.value.split(/\s+/);
                        for (var i = 0; i < words.length; ++i) {
                            var word = words[i].toLowerCase();
                            var wordSpan = document.createElement("span");
                            wordSpan.textContent = word + " ";
                            if (allowedWords[word]) {
                                wordSpan.className = "good-word";
                                wordEntry.insertBefore(wordSpan, input);
                            } else if (word.length > 0) {
                                wordSpan.className = "bad-word";
                                wordEntry.insertBefore(wordSpan, input);
                            }
                        }
                        input.value = "";
                    }
                }, 0);
            }

            function onInputFocus() {
                wordEntry.className = "word-entry focus";
            }

            function onInputBlur() {
                wordEntry.className = "word-entry";
            }

            function onClick(event) {
                if (event.target !== input) {
                    input.focus();
                    input.selectionStart = input.value.length;
                    input.selectionEnd = input.value.length;
                }
            }

            input.addEventListener("change", onInputChange, true);
            input.addEventListener("keydown", onInputChange, true);
            input.addEventListener("focus", onInputFocus, true);
            input.addEventListener("blur", onInputBlur, true);
            wordEntry.addEventListener("click", onClick, true);

            gameElement.appendChild(wordEntry);

            function start() {
                while (wordEntry.firstChild !== input) {
                    wordEntry.removeChild(wordEntry.firstChild);
                }

                input.value = "";
                input.focus();
            }

            return {
                start: start
            };
        }());

        mainElement.appendChild(gameElement);

        var gameMusic = loadSound("game-music", false);

        function start() {
            gameElement.style.display = "block";
            counter.start();
            wordEntry.start();
            gameMusic.play();
        }

        return {
            start: start
        };
    }());

    var titleScreen = (function() {
        var titleScreenElement = document.createElement("div");
        titleScreenElement.style.display = "block";
        titleScreenElement.style.width = "100%";
        titleScreenElement.style.height = "100%";

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

        mainElement.appendChild(titleScreenElement);

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
    }());

    titleScreen.start();

    // Your earth-word ‘purple’ confuses and infuriates us!
    // Give us the rhymes that we demand, or be destroyed!
}());