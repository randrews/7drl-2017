Game = {};

Game.init = function(){
    Game.map = new Map(64, 64);
    Game.player = Game.map.random(function(x,y){ return Game.map.empty(x,y); });
    Game.lastPlayerDirection = 'S';
    Game.map.updateVisibility(Game.player[0], Game.player[1]);
    Game.display = new Display(Game.map);
    Game.scheduler = new ROT.Scheduler.Simple();
    Game.engine = new ROT.Engine(Game.scheduler);
    
    /*
      This engine stuff deserves a little explanation:
      The engine will run through all the actors (which is anything
      with an act() method) in order as long as it's unlocked.
      So, we first add Game to it, symbolizing the player's turn.
      Game's act() method locks the engine, so nothing happens until
      a valid key command. The handleEvent function, if the event
      is a valid move, adds all active enemies to the engine, then
      adds Game (representing the player's next move), then unlocks
      the engine. So, then, the engine calls all the active enemies,
      and then Game, which locks it again waiting for input...
     */
    Game.scheduler.add(Game);

    window.addEventListener('keydown', Game.keyPress);
};

Game.act = function() {
    if(Game.path && Game.path.length > 0) {
        var next = Game.path.shift();
        setTimeout(function(){ Game.doMove(next[0], next[1]); }, 100);
    } else {
        Game.engine.lock();
    }
}

Game.clickMap = function(event) {
    if(Game.path && Game.path.length > 0) return;
    var click = Game.display.display.eventToPosition(event);
    click[0] += Game.display.origin[0];
    click[1] += Game.display.origin[1];

    if(Game.map.empty(click[0], click[1]) && Game.map.get(click[0], click[1], 'visibility')) {
        var pathfinder = new ROT.Path.Dijkstra(click[0], click[1], function(x,y) {
            return Game.map.empty(x, y) && Game.map.get(x, y, 'visibility');
        });
        Game.path = [];
        pathfinder.compute(Game.player[0], Game.player[1], function(x, y){
            Game.path.push([x,y]);
        });
        Game.path.shift(); // The first element is where the player is
        if(Game.path.length > 0) Game.act();
    }
};

Game.clearPath = function(){
    Game.path = [];
};

Game.keyPress = function(event) {
    var keys = {}
    keys[ROT.VK_UP] = 0;
    keys[ROT.VK_RIGHT] = 1;
    keys[ROT.VK_DOWN] = 2;
    keys[ROT.VK_LEFT] = 3;
    var dir = keys[event.keyCode];

    if(dir != null){
        var delta = ROT.DIRS[4][dir];
        var new_x = Game.player[0] + delta[0];
        var new_y = Game.player[1] + delta[1];
        if(Game.tryMove(new_x, new_y)) Game.doMove(new_x, new_y);
        return event.preventDefault();
    }
};

Game.prepareNextTurn = function() {
    Game.map.eachMob(function(mob){ if(mob.active) Game.scheduler.add(mob); });
    Game.scheduler.add(Game);
};

Game.doMove = function(new_x, new_y) {
    if(new_y < Game.player[1]) Game.lastPlayerDirection = 'N';
    else if(new_y > Game.player[1]) Game.lastPlayerDirection = 'S';
    else if(new_x < Game.player[0]) Game.lastPlayerDirection = 'W';
    else if(new_x > Game.player[0]) Game.lastPlayerDirection = 'E';

    Game.player[0] = new_x;
    Game.player[1] = new_y;
    Game.map.updateVisibility(Game.player[0], Game.player[1]);
    Game.prepareNextTurn();
    Game.engine.unlock();
    Game.display.scroll(Game.lastPlayerDirection);
    Game.display.draw();
};

Game.tryMove = function(x,y) {
    if(Game.map.get(x,y).match('^floor')) return true;
    else return false;
};

$('document').ready(Game.init);

