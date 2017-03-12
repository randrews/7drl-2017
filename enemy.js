Enemy = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x; this.y = y;
    this.frame = ROT.RNG.getUniformInt(0,1);
    this.frameClock = ROT.RNG.getUniformInt(0,9);
    this.direction = ['N', 'S', 'E', 'W'].random();
    this.active = false;
};

Enemy.prototype.mobSprite = function() {
    return this.sprite + this.direction + this.frame;
};

Enemy.prototype.animate = function(tick) {
    if(tick == this.frameClock)
        this.frame = (this.frame + 1) % 2;
};

Enemy.prototype.can = function(action){
    // actions are 'shove', 'kill', 'enter'
    return action != 'enter';
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

//////////////////////////////////////////////////

Ice = function(x, y) {
    this.x = x; this.y = y;
    this.active = true;
};

Ice.prototype.mobSprite = function() {
    return 'ice';
};

Ice.prototype.act = function() {};
Ice.prototype.awaken = function() {};
Ice.prototype.animate = function(tick) {};
Ice.prototype.can = function(action){ return false; };

//////////////////////////////////////////////////

StairsDown = function(x, y) {
    this.x = x; this.y = y;
    this.active = true;
};

StairsDown.prototype.mobSprite = function() {
    return 'stairsD';
};

StairsDown.prototype.act = function() {};
StairsDown.prototype.awaken = function() {};
StairsDown.prototype.animate = function(tick) {};
StairsDown.prototype.can = function(action){
    return action == 'enter';
};
StairsDown.prototype.enter = function(){
    Game.nextLevel();
};

//////////////////////////////////////////////////

StairsUp = function(x, y) {
    this.x = x; this.y = y;
    this.active = true;
};

StairsUp.prototype.mobSprite = function() {
    return 'stairsU';
};

StairsUp.prototype.act = function() {};
StairsUp.prototype.awaken = function() {};
StairsUp.prototype.animate = function(tick) {};
StairsUp.prototype.can = function(action){
    return action == 'enter';
};
StairsUp.prototype.enter = function(){}

//////////////////////////////////////////////////

Scroll = function(x, y) {
    this.x = x; this.y = y;
    this.active = true;
};

Scroll.prototype.mobSprite = function(){ return 'scroll'; };
Scroll.prototype.act = function() {};
Scroll.prototype.awaken = function() {};
Scroll.prototype.animate = function(tick) {};
Scroll.prototype.can = function(action){
    return action == 'enter';
};
Scroll.prototype.enter = function(){
    var that = this;
    var spells = [
        ['Heal', 'Heal 1 life', 2],
        ['Fire', 'Shoot a fireball', 5],
        ['Lightning', 'Kill adjacent enemies', 5],
        ['Freeze', 'Freeze an enemy', 5],
        ['Teleport', 'Teleport yourself', 5],
        ['Shield', 'Protect yourself from attacks for 5 turns', 3]
    ];

    var spell = spells.random();

    var str = 'You have found a scroll: '+ spell[0];
    
    str += '<br/>';

    if(!Status.spells[spell[0]]) {
        if(Status.spellCount < 3) {
            str += '<br/>' + '<a href="#" action="add">Keep it</a>';
        } else {
            for(var name in Status.spells)
                str += '<br/>' + '<a href="#" action="'+name+'">Replace "'+name+'"</a>';
        }
    }

    str += '<br/>' + '<a href="#" action="convert">Increase your mana</a>';
    $('.message').html(str);
    $('.scroll').show();
    $('.scroll a').click(function(event){
        var action = $(this).attr('action');
        if(action == 'add') {
            Status.addSpell.apply(Status, spell);
        } else if(action == 'convert') {
            if(Game.maxMana < 16) Game.maxMana++;
            if(Game.mana < Game.maxMana) Game.mana++;
        } else {
            Status.removeSpell(action);
            Status.addSpell.apply(Status, spell);
        }
        $('.scroll').hide();
        Game.map.removeMob(that);
    });
}
