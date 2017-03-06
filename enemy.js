Enemy = function(sprite) {
    this.sprite = sprite;
    this.frame = ROT.RNG.getUniformInt(0,1);
    this.frameClock = ROT.RNG.getUniformInt(0,9);
    this.direction = ['N', 'S', 'E', 'W'].random();
};

Enemy.prototype.mobSprite = function() {
    return this.sprite + this.direction + this.frame;
};

Enemy.prototype.animate = function(tick) {
    if(tick == this.frameClock)
        this.frame = (this.frame + 1) % 2;
}
