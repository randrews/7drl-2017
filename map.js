Map = function(w, h){
    var that = this;
    this.w = w;
    this.h = h;
    this.layers = {};
    this.mobs = [];
    this.clear('cells');
    this.clear('visibility');
    this.clear('color');
    this.clear('mobs');

    var spriteWeights = {
        1: 10,
        2: 1,
        3: 1,
        4: 1
    };
    var directionWeights = { N: 1, S: 1, E: 1, W: 1 };

    var map = new ROT.Map.Cellular(w, h);
    map.randomize(0.5);
    for(var k=0; k<4; k++) map.create();
    map.connect(function(x,y,type){
        if(type == 1 && x!=0 && y!=0 && x!=w-1 && y!=h-1)
            type = 'floor' + ROT.RNG.getWeightedValue(spriteWeights);
        else
            type = 'wall' + ROT.RNG.getWeightedValue(spriteWeights);
        that.layers.cells[x+y*w] = type;
    }, 1);

    for(var n=0; n<w*(h-1); n++)
        if(this.layers.cells[n].match('^wall') &&
           this.layers.cells[n+w].match('^floor'))
            this.layers.cells[n] = 'front' + ROT.RNG.getWeightedValue(spriteWeights);

    this.makeFov();

    for(var n=0; n<64; n++){
        var point = this.random(function(x, y){ return that.empty(x, y); });
        var mob = new Enemy('skeleton', point[0], point[1]);
        this.set(point[0], point[1], mob, 'mobs');
        this.mobs.push(mob);
    }
};

Map.prototype.clear = function(layer){
    this.layers[layer] = [];
    return this;
};

Map.prototype.inBounds = function(x, y){
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
};

Map.prototype.each = function(fn, layer){
    for(var y=0; y < this.h; y++)
        for(var x=0; x < this.w; x++)
            fn(x, y, this.layers[layer || 'cells'][x+y*this.w]);
};

Map.prototype.eachMob = function(fn){
    for(var n=0; n < this.mobs.length; n++) fn(this.mobs[n]);
};

Map.prototype.get = function(x, y, layer){
    return this.layers[layer || 'cells'][x+y*this.w];
};

Map.prototype.set = function(x, y, v, layer){
    this.layers[layer || 'cells'][x+y*this.w] = v;
};

Map.prototype.empty = function(x, y){
    return this.get(x, y).match('^floor') && !this.get(x, y, 'mobs');
};

Map.prototype.navigable = function(x, y){
    var tile = this.get(x, y);
    return tile && tile.match('^floor');
};

Map.prototype.adjacent = function(a, b){
    var dx = Math.abs(a[0] - b[0]);
    var dy = Math.abs(a[1] - b[1]);
    return dx <= 1 && dy <= 1;
};

Map.prototype.direction = function(a,b){
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];

    if(dx==0 && dy<0) return 'N';
    if(dx>0 && dy<0) return 'NE';
    if(dx>0 && dy==0) return 'E';
    if(dx>0 && dy>0) return 'SE';
    if(dx==0 && dy>0) return 'S';
    if(dx<0 && dy>0) return 'SW';
    if(dx<0 && dy==0) return 'W';
    if(dx<0 && dy<0) return 'NW';
};

Map.prototype.random = function(fn){
    var point = [ROT.RNG.getUniformInt(0,this.w-1),
                 ROT.RNG.getUniformInt(0,this.h-1)];
    if(fn)
        while(!fn(point[0], point[1]))
            point = [ROT.RNG.getUniformInt(0,this.w-1),
                     ROT.RNG.getUniformInt(0,this.h-1)];
    return point;
};

Map.prototype.makeFov = function(){
    this.fov = new ROT.FOV.PreciseShadowcasting(function(x, y){
        if(!Game.map.inBounds(x,y)) return false;
        if(Game.map.get(x,y).match('^wall') || Game.map.get(x,y).match('^front')) return false;
        return true;
    });

    this.lighting = new ROT.Lighting(null, {range: 11, passes: 1});
    this.lighting.setFOV(this.fov);
};

Map.prototype.updateVisibility = function(px, py){
    var that = this;
    this.each(function(x,y,v){
        if(v == 1) that.set(x,y,2,'visibility');
    }, 'visibility');

    this.fov.compute(px, py, 10, function(x, y, r, visibility) {
        that.set(x, y, 1, 'visibility');
        if(that.get(x,y,'mobs') && that.get(x,y,'mobs').active == false) that.get(x,y,'mobs').awaken();
    });

    this.lighting.clearLights();
    this.clear('color');
    this.lighting.setLight(px, py, [255, 255, 160]);
    this.lighting.compute(function(x, y, c){
        that.set(x, y, c, 'color');
    });
};
