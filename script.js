(function(){
    addPlayButton();
    animateTitle();

    function addPlayButton() {
        var game = getGame();
        var title = getTitle();
        var button = document.createElement('button');
        button.className="play-button";
        button.appendChild(document.createTextNode('Play Game'));
        game.insertBefore(button, title);
        game.insertBefore(title, button);
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

    // Your earth-word ‘purple’ confuses and infuriates us!
    // Give us the rhymes that we demand, or be destroyed!
}());