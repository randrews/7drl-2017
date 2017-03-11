function Effect(name){
    this.frames = 3;
    if(typeof(name) == 'string') {
        this.name = name;
        this.frame = 0;
    } else {
        this.queue = name;
        this.next();
    }

    this.active = true;
}

Effect.prototype.act = function(){
    if(++(this.frame) > this.frames){
        if(this.queue) this.next();
        else this.active = false;
    }
};

Effect.prototype.sprite = function(){
    if(this.frame >= this.frames) return '';
    else return this.name + this.frame;
};

Effect.prototype.next = function(){
    this.name = this.queue.shift();
    this.frame = 0;
    if(this.queue.length == 0) delete this.queue;
}

Effect.prototype.enqueue = function(name){
    if(this.queue) this.queue.push(name);
    else this.queue = [name];
};

//////////////////////////////////////////////////

function Bullet(start, direction, sprite){
    this.position = [start[0], start[1]];
    this.direction = direction;
    this.spriteName = sprite;
    this.active = true;
};

Bullet.prototype = Object.create(Effect.prototype);

Bullet.prototype.sprite = function(){ return this.spriteName; }

Bullet.prototype.act = function() {
    this.position[0] += this.direction[0];
    this.position[1] += this.direction[1];
    if(!Game.display.map.navigable(this.position[0], this.position[1])) {
        this.active = false;
        return;
    }

    var mob = Game.display.map.get(this.position[0], this.position[1], 'mobs');
    if(mob) {
        Game.killMob(this.position[0], this.position[1]);
    }
};
