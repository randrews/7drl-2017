Map = function(w, h){
    var that = this;
    this.w = w;
    this.h = h;
    this.layers = {};
    this.clear('cells');
    this.clear('visibility');
    this.clear('color');

    var spriteWeights = {
        1: 10,
        2: 1,
        3: 1,
        4: 1
    };

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

Map.prototype.get = function(x, y, layer){
    return this.layers[layer || 'cells'][x+y*this.w];
};

Map.prototype.set = function(x, y, v, layer){
    this.layers[layer || 'cells'][x+y*this.w] = v;
};

Map.prototype.random = function(fn){
    var point = [ROT.RNG.getUniformInt(0,this.w),
                 ROT.RNG.getUniformInt(0,this.h)];
    if(fn)
        while(!fn(point[0], point[1]))
            point = [ROT.RNG.getUniformInt(0,this.w),
                     ROT.RNG.getUniformInt(0,this.h)];
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
    });

    this.lighting.clearLights();
    this.clear('color');
    this.lighting.setLight(px, py, [255, 255, 160]);
    this.lighting.compute(function(x, y, c){
        that.set(x, y, c, 'color');
    });
};