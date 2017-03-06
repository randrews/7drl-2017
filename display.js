Display = function(map) {
    Display.opts.tileSet = document.createElement('img');
    Display.opts.tileSet.src = 'tiny_dungeon.png';

    this.map = map;
    this.makeDisplay();
    var that = this;
    $(window).resize(function(){
        that.makeDisplay();
        that.scroll();
        that.draw();
    });
    Display.opts.tileSet.onload = function(){ that.draw() };

    this.playerFrame = 1;
    this.tick = 0;
    this.animation = setInterval(function() {
        that.tick = (that.tick + 1) % 10;
        if(that.tick % 5 == 0)
            that.playerFrame = (that.playerFrame + 1) % 2;
        
        for(var i=0; i<that.map.mobs.length; i++) that.map.mobs[i].animate(that.tick);
        that.draw();
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
                 }
               };

Display.prototype.playerSprite = function() {
    return 'player' + Game.lastPlayerDirection + this.playerFrame;
};

Display.prototype.makeDisplay = function() {
    $('.main-map *').remove();
    Display.opts.width = Math.floor($(window).width() / 32);
    Display.opts.height =  Math.floor($(window).height() / 32);

    this.display = new ROT.Display(Display.opts);
    $('.main-map').append(this.display.getContainer());
};

Display.prototype.draw = function(){
    var that = this;
    for(var x=this.origin[0]; x < this.origin[0] + Display.opts.width; x++)
        for(var y=this.origin[1]; y < this.origin[1] + Display.opts.height; y++) {
            if(this.map.get(x, y, 'visibility') == 1) {
                var color = 'rgba(' + this.map.get(x, y, 'color').join(',') + ',0.1)';
                var mob = this.map.get(x, y, 'mobs');

                if(mob)
                    this.display.draw(x - this.origin[0], y - this.origin[1], [this.map.get(x, y), mob.mobSprite()], 'transparent', color);
                else
                    this.display.draw(x - this.origin[0], y - this.origin[1], [this.map.get(x, y)], color);
            } else if(this.map.get(x, y, 'visibility') == 2) {
                this.display.draw(x - this.origin[0], y - this.origin[1], this.map.get(x, y), 'rgba(0,0,0,0.65)');
            } else {
                this.display.draw(x - this.origin[0], y - this.origin[1], this.map.get(x, y), 'rgba(0,0,0,1)');
            }
        }

    this.display.draw(Game.player[0] - this.origin[0], Game.player[1] - this.origin[1],
                      [this.map.get(Game.player[0], Game.player[1]),
                       this.playerSprite()], 'transparent', 'rgba(255,255,160,0.1)');
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
