Display = function(map) {
    Display.opts.tileSet = document.createElement('img');
    Display.opts.tileSet.src = 'tiny_dungeon.png';

    this.status = new Status();

    this.effects = {};
    this.spell = null;
    this.dirty = {};
    this.map = map;
    this.makeDisplay();
    var that = this;
    $(window).resize(function(){
        that.makeDisplay();
        that.scroll();
        that.draw();
    });
    Display.opts.tileSet.onload = function(){
        that.draw();
        Game.engine.start();
    };

    this.playerFrame = 1;
    this.tick = 0;
    this.animation = setInterval(function() {
        that.tick = (that.tick + 1) % 10;
        if(that.tick % 5 == 0)
            that.playerFrame = (that.playerFrame + 1) % 2;

        that.map.eachMob(function(mob){mob.animate(that.tick);});

        that.draw(true);

        for(var i in that.effects){
            that.effects[i].act();
            if(!that.effects[i].active) delete that.effects[i];
        }

        if(that.spell){
            that.spell.markDirty(that.dirty);

            that.spell.act();
            if(!that.spell.active){
                that.spell.markDirty(that.dirty);
                that.spell = null;
            }
        }

    }, 100);

    this.origin = [];
    this.scroll();
};

Display.opts = { width: 0,
                 height: 0,
                 layout: 'tile',
                 tileWidth: 32,
                 tileHeight: 32,
                 tileSet: null,
                 tileColorize: true,
                 tileMap: {
                     '': [256, 256],
                     'floor1': [0, 128],
                     'floor2': [32, 128],
                     'floor3': [64, 128],
                     'floor4': [96, 128],
                     'wall1': [192, 0],
                     'wall2': [224, 0],
                     'wall3': [256, 0],
                     'wall4': [288, 0],
                     'front1': [0, 0],
                     'front2': [32, 0],
                     'front3': [64, 0],
                     'front4': [96, 0],

                     'playerE0': [192, 128],
                     'playerE1': [192, 160],
                     'playerS0': [224, 128],
                     'playerS1': [224, 160],
                     'playerN0': [256, 128],
                     'playerN1': [256, 160],
                     'playerW0': [288, 128],
                     'playerW1': [288, 160],

                     'skeletonE0': [192, 192],
                     'skeletonE1': [192, 224],
                     'skeletonS0': [224, 192],
                     'skeletonS1': [224, 224],
                     'skeletonN0': [256, 192],
                     'skeletonN1': [256, 224],
                     'skeletonW0': [288, 192],
                     'skeletonW1': [288, 224],

                     'shove0': [192, 256],
                     'shove1': [224, 256],
                     'shove2': [256, 256],
                     'slashL0': [192, 288],
                     'slashL1': [224, 288],
                     'slashL2': [256, 288],
                     'slashR0': [192, 320],
                     'slashR1': [224, 320],
                     'slashR2': [256, 320],
                     'kill0': [0, 256],
                     'kill1': [32, 256],
                     'kill2': [64, 256],

                     'fireballW': [32, 288],
                     'fireballNE': [64, 288],
                     'fireballE': [0, 320],
                     'fireballSE': [32, 320],
                     'fireballS': [64, 320],
                     'fireballSW': [96, 320],
                     'fireballN': [128, 320],
                     'fireballNW': [160, 320],

                     'lightning0': [288, 256],
                     'lightning1': [288, 288],
                 }
               };

Display.prototype.busy = function() {
    return this.spell;
};

Display.prototype.playerSprite = function() {
    return 'player' + Game.lastPlayerDirection + this.playerFrame;
};

Display.prototype.makeDisplay = function() {
    $('.main-map *').remove();
    Display.opts.width = Math.floor($('#container').width() / 32);
    Display.opts.height =  Math.floor($('#container').height() / 32);

    this.display = new ROT.Display(Display.opts);
    $('.main-map').append(this.display.getContainer());
    this.display.getContainer().addEventListener('click', Game.clickMap);
};

Display.prototype.draw = function(animateOnly){
    var that = this;
    for(var x=this.origin[0]; x < this.origin[0] + Display.opts.width; x++)
        for(var y=this.origin[1]; y < this.origin[1] + Display.opts.height; y++) {
            if(this.map.get(x, y, 'visibility') == 1) {
                if(!animateOnly || this.containsAnimations(x, y) || this.dirty[x+','+y])
                    this.drawVisibleCell(x, y);
                delete this.dirty[x+','+y];
            } else if(this.map.get(x, y, 'visibility') == 2 && !animateOnly) {
                this.drawRememberedCell(x, y);
            } else if(!animateOnly){
                this.display.draw(x - this.origin[0], y - this.origin[1], this.map.get(x, y), 'rgba(0,0,0,1)');
            }
        }
    this.status.draw();
};

Display.prototype.containsAnimations = function(x,y) {
    if(this.effects[x+','+y]) return true;
    if(this.spell && this.spell.affects([x,y])) return true;
    if(this.map.get(x,y,'mobs')) return true;
    if(x == Game.player[0] && y == Game.player[1]) return true;
    return false;
};

Display.prototype.drawVisibleCell = function(x, y) {
    var color = 'rgba(' + this.map.get(x, y, 'color').join(',') + ',0.11)';
    var mob = this.map.get(x, y, 'mobs');
    var effect = this.effects[x + ',' + y];
    var sprites = [this.map.get(x, y)];

    if(mob) sprites.push(mob.mobSprite());
    if(Game.player[0] == x && Game.player[1] == y) sprites.push(this.playerSprite());
    if(this.spell && this.spell.affects([x,y])) sprites.push(this.spell.sprite());
    if(effect) sprites.push(effect.sprite());

    if(sprites.length == 1)
        this.display.draw(x - this.origin[0], y - this.origin[1], sprites, color);
    else
        this.display.draw(x - this.origin[0], y - this.origin[1], sprites, 'transparent', color);
};

Display.prototype.drawRememberedCell = function(x, y) {
    this.display.draw(x - this.origin[0], y - this.origin[1], this.map.get(x, y), 'rgba(0,0,0,0.65)');
};

Display.prototype.addEffect = function(x, y, name) {
    if(this.effects[x+','+y]) this.effects[x+','+y].enqueue(name);
    else this.effects[x+','+y] = new Effect(name);
};

Display.prototype.setSpell = function(spell) {
    this.spell = spell;
};

Display.prototype.setBiome = function(biome, type) {
    if(type == null){
        this.setBiome(biome*32, 'front');
        this.setBiome(biome*32, 'wall');
        this.setBiome((biome+4)*32, 'floor');
        return;
    }
    var tmap = Display.opts.tileMap;
    for(k in tmap) {
        if(k.match('^' + type)) tmap[k][1] = biome;
    }
};

Display.prototype.scroll = function(dir){
    var tolerance = 3;
    if(dir == 'N') {
        while(Game.player[1] - this.origin[1] < Display.opts.height / 2 - tolerance && this.origin[1] > 0) this.origin[1]--;
    } else if(dir == 'S') {
        while(Game.player[1] - this.origin[1] > Display.opts.height / 2 + tolerance && this.origin[1] < this.map.h - Display.opts.height) this.origin[1]++;
    } else if(dir == 'W') {
        while(Game.player[0] - this.origin[0] < Display.opts.width / 2 - tolerance && this.origin[0] > 0) this.origin[0]--;
    } else if(dir == 'E') {
        while(Game.player[0] - this.origin[0] > Display.opts.width / 2 + tolerance && this.origin[0] < this.map.w - Display.opts.width) this.origin[0]++;
    } else {
        this.origin[0] = Math.floor(Game.player[0] - Display.opts.width / 2);
        this.origin[1] = Math.floor(Game.player[1] - Display.opts.height / 2);

        if(this.origin[0] < 0) this.origin[0] = 0;
        if(this.origin[0] >= this.map.w - Display.opts.width - 1) this.origin[0] = this.map.w - Display.opts.width;
        if(this.origin[1] < 0) this.origin[1] = 0;
        if(this.origin[1] >= this.map.h - Display.opts.height - 1) this.origin[1] = this.map.h - Display.opts.height;
    }
}
