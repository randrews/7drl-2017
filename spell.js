function Bullet(start, direction, sprite){
    this.position = [start[0], start[1]];
    this.direction = direction;
    this.spriteName = sprite;
    this.active = true;
};

Bullet.prototype.sprite = function(){ return this.spriteName; };
Bullet.prototype.affects = function(pt){ return this.position[0] == pt[0] && this.position[1] == pt[1]; };
Bullet.prototype.markDirty = function(dirty) {
    dirty[this.position[0]+','+this.position[1]] = true;
};

Bullet.prototype.act = function() {
    this.position[0] += this.direction[0];
    this.position[1] += this.direction[1];
    if(!Game.display.map.navigable(this.position[0], this.position[1])) {
        this.active = false;
        Game.enemyTurn();
        return;
    }

    var mob = Game.display.map.get(this.position[0], this.position[1], 'mobs');
    if(mob) {
        Game.killMob(this.position[0], this.position[1]);
    }
};

//////////////////////////////////////////////////

function Lightning() {
    this.frame = 0;
    this.active = true;
};

Lightning.prototype.act = function(){
    this.active = (this.frame++) < 10;
};

Lightning.prototype.sprite = function(){ return 'lightning' + (this.frame % 2); };

Lightning.prototype.affects = function(pt){
    return Game.map.adjacent(pt, Game.player) && (Game.player[0] != pt[0] || Game.player[1] != pt[1]);
};

Lightning.prototype.markDirty = function(dirty) {
    dirty[(Game.player[0]-1)+','+Game.player[1]] = true;
    dirty[(Game.player[0]+1)+','+Game.player[1]] = true;

    dirty[(Game.player[0]-1)+','+(Game.player[1]-1)] = true;
    dirty[Game.player[0]+','+(Game.player[1]-1)] = true;
    dirty[(Game.player[0]+1)+','+(Game.player[1]-1)] = true;

    dirty[(Game.player[0]-1)+','+(Game.player[1]+1)] = true;
    dirty[Game.player[0]+','+(Game.player[1]+1)] = true;
    dirty[(Game.player[0]+1)+','+(Game.player[1]+1)] = true;
};
