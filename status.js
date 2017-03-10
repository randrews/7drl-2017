function Status(){
    var that = this;
    $('.status *').remove();

    Status.opts.tileSet = document.createElement('img');
    Status.opts.tileSet.src = 'tiny_dungeon.png';
    Status.opts.tileSet.onload = function(){
        that.drawable = true;
        that.display = new ROT.Display(Status.opts);
        $('.status').append(that.display.getContainer());
    };
}

Status.opts = { width: 16,
                height: 2,
                layout: 'tile',
                tileWidth: 16,
                tileHeight: 16,
                tileSet: null,
                tileMap: {
                    'heart1': [0, 288],
                    'heart0': [16,288],
                    'mana1': [0, 304],
                    'mana0': [16,304],
                 }
              };

Status.prototype.draw = function(){
    if(!this.drawable) return;
    for(var n=0; n<Game.maxHealth; n++){
        if(n < Game.health) this.display.draw(n, 0, 'heart1');
        else this.display.draw(n, 0, 'heart0')
    }

    for(var n=0; n<Game.maxMana; n++){
        if(n < Game.mana) this.display.draw(n, 1, 'mana1');
        else this.display.draw(n, 1, 'mana0')
    }
};
