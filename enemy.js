Enemy = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x; this.y = y;
    this.frame = ROT.RNG.getUniformInt(0,1);
    this.frameClock = ROT.RNG.getUniformInt(0,9);
    this.direction = ['N', 'S', 'E', 'W'].random();
    this.active = false;
    this.id = ROT.RNG.getUniformInt(0,1000);
};

Enemy.prototype.mobSprite = function() {
    return this.sprite + this.direction + this.frame;
};

Enemy.prototype.animate = function(tick) {
    if(tick == this.frameClock)
        this.frame = (this.frame + 1) % 2;
};

Enemy.prototype.shove = function(x, y){
    this.stunned = true;
    this.x = x; this.y = y;
};

Enemy.prototype.act = function() {
    if(this.stunned){
        this.stunned = false;
        return;
    }

    if(Game.map.adjacent([this.x, this.y], Game.player)){
        Game.attack(this);
    } else {
        if(this.x > Game.player[0] && this.y > Game.player[1] && Game.tryEnemyMove(this, this.x-1, this.y-1)) return;
        if(this.x < Game.player[0] && this.y > Game.player[1] && Game.tryEnemyMove(this, this.x+1, this.y-1)) return;
        if(this.x < Game.player[0] && this.y < Game.player[1] && Game.tryEnemyMove(this, this.x+1, this.y+1)) return;
        if(this.x > Game.player[0] && this.y < Game.player[1] && Game.tryEnemyMove(this, this.x-1, this.y+1)) return;
        if(this.y < Game.player[1] && Game.tryEnemyMove(this, this.x, this.y+1)) return;
        if(this.y > Game.player[1] && Game.tryEnemyMove(this, this.x, this.y-1)) return;
        if(this.x < Game.player[0] && Game.tryEnemyMove(this, this.x+1, this.y)) return;
        if(this.x > Game.player[0] && Game.tryEnemyMove(this, this.x-1, this.y)) return;
    }
};

Enemy.prototype.awaken = function() {
    this.active = true;
    Game.clearPath();
};
