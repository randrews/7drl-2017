Enemy = function(sprite) {
    this.sprite = sprite;
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

Enemy.prototype.act = function() {
};

Enemy.prototype.awaken = function() {
    this.active = true;
    Game.clearPath();
    console.log('Enemy ' + this.id + ' awaking');
};
