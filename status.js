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
    Status.spellCount = 0;

    Status.addSpell('Heal', 'Heal 1 life', 2);

    Status.log('Welcome to Sevendral! Enjoy your quest');
}

Status.spells = {};

Status.log = function(str, tooltip){
    if(tooltip){
        Status.tipText = str;
        Status.oldText = $('.log').text(); 
    }
    $('.log').text(str);
};

Status.showSpellDescription = function(event) {
    spell = Status.spells[$(this).attr('name')];
    Status.log(spell.cost+': '+spell.description, true);
};

Status.hideSpellDescription = function(event) {
    if($('.log').text() == Status.tipText)
        Status.log(Status.oldText || '');
};

Status.addSpell = function(name, description, cost) {
    if(Status.spells[name]) return;
    Status.spells[name] = { name: name, description: description, cost: cost };
    Status.spellCount++;
    var button = document.createElement('button');
    Status.spells[name].button = button;
    $(button).text(name);
    $(button).attr('name', name);
    $('.spells').append(button);
    $(button).on('mouseenter', Status.showSpellDescription);
    $(button).on('mouseleave', Status.hideSpellDescription);
    $(button).on('click', Game.cast);
};

Status.removeSpell = function(name) {
    if(!Status.spells[name]) return;
    Status.spellCount--;
    $(Status.spells[name].button).remove();
    delete Status.spells[name];
};

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

    for(var name in Status.spells) {
        var afford = Status.spells[name].cost <= Game.mana;
        $(Status.spells[name].button).attr('disabled', !afford);
    }
};
