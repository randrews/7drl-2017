Game = {};

Game.init = function(){
    Game.map = new Map(64, 64);
    Game.player = Game.map.random(function(x,y){ return Game.map.empty(x,y); });
    Game.lastPlayerDirection = 'S';
    Game.map.updateVisibility(Game.player[0], Game.player[1]);
    Game.display = new Display(Game.map);
    Game.scheduler = new ROT.Scheduler.Simple();
    Game.engine = new ROT.Engine(Game.scheduler);

    Game.maxHealth = 10;
    Game.health = 10;
    Game.maxMana = 5;
    Game.mana = 5;
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
        setTimeout(function(){
            if(Game.tryMove(next[0], next[1])){
                Game.doMove(next[0], next[1]);
            } else {
                Game.clearPath();
            }
        }, 100);
    } else {
        Game.engine.lock();
    }
}

Game.clickMap = function(event) {
    if(Game.path && Game.path.length > 0) return;
    var click = Game.display.display.eventToPosition(event);
    click[0] += Game.display.origin[0];
    click[1] += Game.display.origin[1];

    if(Game.map.navigable(click[0], click[1]) && Game.map.get(click[0], click[1], 'visibility')) {
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
        if(Game.tryMove(new_x, new_y)) {
            Game.doMove(new_x, new_y);
        }
        return event.preventDefault();
    }
};

Game.prepareNextTurn = function() {
    Game.map.eachMob(function(mob){ if(mob.active) Game.scheduler.add(mob); });
    Game.scheduler.add(Game);
};

Game.doAttack = function(new_x, new_y) {
    var tgtx = new_x*2 - Game.player[0];
    var tgty = new_y*2 - Game.player[1];
    var mob = Game.map.get(tgtx, tgty, 'mobs');
    if(Game.map.empty(new_x, new_y) && mob){
        Game.map.set(tgtx, tgty, null, 'mobs');
        var idx = Game.map.mobs.findIndex(function(e){ return e === mob; });
        Game.map.mobs.splice(idx, 1);
        Game.display.addEffect(tgtx, tgty, 'kill');
    }
};

Game.canShove = function(new_x, new_y) {
    var tgtx = new_x*2 - Game.player[0];
    var tgty = new_y*2 - Game.player[1];
    var mob = Game.map.get(new_x, new_y, 'mobs');

    return mob && Game.map.empty(tgtx, tgty);
};

Game.doShove = function(new_x, new_y) {
    var tgtx = new_x*2 - Game.player[0];
    var tgty = new_y*2 - Game.player[1];
    var mob = Game.map.get(new_x, new_y, 'mobs');

    Game.map.set(new_x, new_y, null, 'mobs');
    Game.display.addEffect(new_x, new_y, 'shove');
    Game.map.set(tgtx, tgty, mob, 'mobs');
    mob.shove(tgtx, tgty);
};

Game.doMove = function(new_x, new_y) {
    Game.doAttack(new_x, new_y);

    var moved_dirs = [];
    if(new_y < Game.player[1]) moved_dirs.push('N');
    if(new_y > Game.player[1]) moved_dirs.push('S');
    if(new_x > Game.player[0]) moved_dirs.push('E');
    if(new_x < Game.player[0]) moved_dirs.push('W');

    Game.lastPlayerDirection = moved_dirs[0];

    if(Game.isBump(new_x, new_y)){
        if(Game.canShove(new_x, new_y)) {
            Game.doShove(new_x, new_y);
        }
    } else {
        Game.player[0] = new_x;
        Game.player[1] = new_y;
        Game.map.updateVisibility(Game.player[0], Game.player[1]);
        Game.display.scroll(moved_dirs[0]);
        if(moved_dirs[1]) Game.display.scroll(moved_dirs[1]);
    }

    Game.prepareNextTurn();
    Game.engine.unlock();
    Game.display.draw();
};

Game.attack = function(enemy) {
    Game.health--;
    Game.display.addEffect(Game.player[0], Game.player[1], ['slashL', 'slashR'].random());
};

Game.tryMove = function(x,y) {
    return Game.map.navigable(x,y);
};

Game.isBump = function(x,y) {
    return Game.map.get(x,y, 'mobs');
};

Game.tryEnemyMove = function(enemy, x, y) {
    if(Game.map.empty(x,y) && (x != Game.player[0] || y != Game.player[1])) {
        Game.map.set(enemy.x, enemy.y, null, 'mobs');
        enemy.x = x; enemy.y = y;
        Game.map.set(enemy.x, enemy.y, enemy, 'mobs');
        return true;
    }
    return false;
};

$('document').ready(Game.init);

