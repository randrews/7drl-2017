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
    window.addEventListener('keydown', Game);
};

Game.act = function() { Game.engine.lock(); }

Game.handleEvent = function(event) {
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
        switch(dir) {
        case 0: Game.lastPlayerDirection = 'N'; break;
        case 1: Game.lastPlayerDirection = 'E'; break;
        case 2: Game.lastPlayerDirection = 'S'; break;
        case 3: Game.lastPlayerDirection = 'W'; break;
        }
        if(Game.tryMove(new_x, new_y)) {
            Game.player[0] = new_x;
            Game.player[1] = new_y;
            Game.map.updateVisibility(Game.player[0], Game.player[1]);
            Game.prepareNextTurn();
            Game.engine.unlock();
        }
        Game.display.scroll(Game.lastPlayerDirection);
        Game.display.draw();
        return event.preventDefault();
    }
};

Game.prepareNextTurn = function() {
    Game.map.eachMob(function(mob){ if(mob.active) Game.scheduler.add(mob); });
    Game.scheduler.add(Game);
};

Game.tryMove = function(x,y) {
    if(Game.map.get(x,y).match('^floor')) return true;
    else return false;
};

$('document').ready(Game.init);

