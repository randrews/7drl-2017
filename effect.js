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
