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

        mainElement.addEventListener("scroll", function(event) {
            event.target.scrollTop = 0;
            event.target.scrollLeft = 0;
            return false;
        }, true);

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

    (function() {
        var background = document.createElement("div");
        background.className = "background";

        for (var i=0; i<40; ++i) {
            (function() {
                var square = document.createElement("div");
                square.style.position = "absolute";
                var startTime, size, speed;

                function start() {
                    startTime = time();
                    size = Math.random() * 256 + 16;
                    speed = Math.random() * 15 + 1;
                    square.style.top = Math.random() * (600 + size + size) - size + "px";
                    square.style.width = size + "px";
                    square.style.height = size + "px";
                    square.style.opacity = Math.random() * 0.1;
                    onAnimationFrame();
                }

                function onAnimationFrame() {
                    var f = (time() - startTime) / (1000 / 60);
                    var left = 800 - speed * f;
                    square.style.left = left + "px";

                    if (left <= -size) {
                        start();
                    } else {
                        requestAnimationFrame(onAnimationFrame);
                    }
                }

                start();

                background.appendChild(square);
            }());
        }

        mainElement.appendChild(background);
    }());

    var game = (function() {
        var gameElement = document.createElement("div");
        gameElement.className = "game";
        gameElement.style.display = "none";

        var counter = (function() {
            var counterElement = document.createElement("div");
            var won = false;
            counterElement.className = "counter";
            gameElement.appendChild(counterElement);

            function start() {
                var startTime = time();
                var signalledTimeUp = false;
                won = false;

                function onAnimationFrame() {
                    if (!won) {
                        var seconds = (time() - startTime) / 1000;

                        if (seconds < 11) {
                            counterElement.textContent = Math.ceil(10 - seconds).toString();
                            counterElement.style.opacity = 1 - (seconds % 1);

                            requestAnimationFrame(onAnimationFrame);
                        } else {
                            end();
                        }

                        if (seconds >= 10 && !signalledTimeUp) {
                            signalledTimeUp = true;
                            timeUp();
                        }
                    }
                }

                onAnimationFrame();
            }

            function win() {
                won = true;
            }

            return {
                start: start,
                win: win
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

            var goodWordCount = 0;
            var allowedWordCount = 2;

            var wordEntry = document.createElement("div");
            wordEntry.className = "word-entry";

            var input = document.createElement("input");

            var startTime = time();
            var lostTime = -1;
            function onAnimationFrame() {
                var t = time();
                var f = (t - startTime) / (1000 / 60);

                var top = 0;
                if (lostTime >= 0) {
                    var lostF = (t - lostTime) / (1000 / 60);
                    top = Math.pow(2, lostF * 0.2);
                }

                var v = (Math.sin(f * 6 * Math.PI / 180) * 16 + 16);
                var h = (Math.sin(1.2 + f * 5.5 * Math.PI / 180) * 16 + 24);
                wordEntry.style.top = (240 - v + top) + 'px';
                wordEntry.style.left = (64 - h) + 'px';
                wordEntry.style.right = (64 - h) + 'px';
                wordEntry.style.padding =  v + 'px ' + h + 'px';

                requestAnimationFrame(onAnimationFrame);
            }

            onAnimationFrame();

            function checkInput() {
                var words = input.value.split(/\s+/);
                for (var i = 0; i < words.length; ++i) {
                    var word = words[i].toLowerCase();
                    var wordSpan = document.createElement("span");
                    wordSpan.textContent = word + " ";
                    if (allowedWords[word]) {
                        score.score(1);
                        wordSpan.className = "good-word";
                        wordEntry.insertBefore(wordSpan, input);

                        if (++goodWordCount == allowedWordCount) {
                            wordEntry.removeChild(input);
                            win();
                        }
                    } else if (word.length > 0) {
                        wordSpan.className = "bad-word";
                        wordEntry.insertBefore(wordSpan, input);
                    }
                }
                input.value = "";
            }

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
                        checkInput();
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
                while (wordEntry.firstChild) {
                    wordEntry.removeChild(wordEntry.firstChild);
                }

                goodWordCount = 0;

                wordEntry.appendChild(input);
                input.value = "";
                input.disabled = false;
                input.focus();

                lostTime = -1;
            }

            function timeUp() {
                checkInput();

                if (goodWordCount < allowedWordCount) {
                    wordEntry.removeChild(input);
                    lostTime = time();

                    lose();
                }
            }

            return {
                start: start,
                timeUp: timeUp
            };
        }());

        mainElement.appendChild(gameElement);

        var gameMusic = loadSound("game-music", false);

        function start() {
            gameElement.style.display = "block";
            counter.start();
            wordEntry.start();
            score.start();
            gameMusic.play();
        }

        function end() {
            score.end();
            gameElement.style.display = "none";
            titleScreen.start();
        }

        var winSound = loadSound("winner", false);

        function win() {
            gameMusic.stop();
            winSound.play();
            counter.win();
            // TODO
        }

        function lose() {
            // TODO
        }

        function timeUp() {
            wordEntry.timeUp();
        }

        return {
            start: start
        };
    }());

    var titleScreen = (function() {
        var titleScreenElement = document.createElement("div");
        titleScreenElement.className = "title-screen";
        titleScreenElement.style.display = "block";

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

    var score = (function() {
        var currentScore = 0;
        var highScore = 0;

        var scoreElement = document.createElement("div");
        scoreElement.className = "score";
        mainElement.appendChild(scoreElement);

        function start() {
            currentScore = 0;
            score(0);
        }

        function score(points) {
            currentScore += points;
            scoreElement.textContent = "Score: " + currentScore;
            if (currentScore > highScore) {
                highScore = currentScore;
            }
        }

        function end() {
            scoreElement.textContent = "High Score: " + highScore;
        }

        return {
            start: start,
            score: score,
            end: end
        };
    }());

    titleScreen.start();

    // Your earth-word ‘purple’ confuses and infuriates us!
    // Give us the rhymes that we demand, or be destroyed!
}());