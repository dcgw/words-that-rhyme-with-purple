(function(){
    addPlayButton();
    animateTitle();

    function addPlayButton() {
        var game = getGame();
        var title = getTitle();
        var smallPrint = getSmallPrint();
        var button = document.createElement('button');
        button.style.position = "relative";
        button.addEventListener("click", onClick, true);
        button.className="play-button";
        button.appendChild(document.createTextNode('Play Game'));
        game.insertBefore(button, smallPrint);

        function onClick() {
            button.disabled = true;
            button.className = "play-button active";

            var f = 0;
            var interval = setInterval(function() {
                button.style.top = Math.pow(2, f * 0.2) + 'px';
                title.style.opacity = smallPrint.style.opacity = (1 - f/30).toString();

                if (f == 10) {
                    button.className = "play-button";
                }

                if (++f == 45) {
                    title.style.display = "none";
                    smallPrint.style.display = "none";
                    button.style.display = "none";
                    clearInterval(interval);
                }
            }, 16);
        }
    }

    function animateTitle() {
        var title = getTitle();
        title.style.position = 'relative';

        var f = 0;
        setInterval(function(){
            title.style.top = (Math.sin(f*6*Math.PI/180) * 24) + 'px';
            title.style.lineHeight = (96 + Math.sin(3+f*5*Math.PI/180) * 6) + 'px';
            var transform = 'scale(' + (1 + 0.1*Math.sin(9+f*2*Math.PI/180)) + ')';
            title.style.webkitTransform = transform;
            title.style.mozTransform = transform;
            title.style.transform = transform;
            ++f;
        }, 16);
    }

    function getGame() {
        return document.getElementsByClassName('game')[0];
    }

    function getTitle() {
        return document.getElementsByTagName('h1')[0];
    }

    function getSmallPrint() {
        return document.getElementsByTagName('small')[0];
    }

    // Your earth-word ‘purple’ confuses and infuriates us!
    // Give us the rhymes that we demand, or be destroyed!
}());