;
(function (global) {

    var Fruit = function (game, x, y) {
        Phaser.Sprite.call(this, game, x, y, 'hedgehog');
        game.physics.arcade.enable(this);
        if(Math.random() < 0 /*0.5*/ ){
            this.frame = 5;
            this.anchor.setTo(3/24, 7/24); //so it flips around its middle
            this.body.setSize(0, 14, 0, 0);
        }else{
            this.frame = 6;
            this.anchor.setTo(3/24, 0);
            this.body.setSize(12, 14, -5, 0);
        }



        //this._body = this.body;


        /**Object.defineProperty(this, 'body', {
            get: function() {
               return this._body;
            },
            set: function(value) {
                if(value === null){
                    debugger;
                }
                this._body = value;
            }
        });**/



        this.body.immovable = true;
        this.body.move = false;
        this.connected = true;
    };

    Fruit.prototype = Object.create(Phaser.Sprite.prototype);
    Fruit.prototype.constructor = Fruit;

    Fruit.prototype.init = function () {

    };

    var snd = 0;

    Fruit.prototype.pling = function(){
        snd = (snd+1)%8;
        SND[snd].play();
    };


    Fruit.prototype.update = function () {
        if(!this.alive){
            this.destroy();
            return;
        }

        if(!this.connected){
            this.y += 3;
            if(this.y > HEIGHT +50){
                this.destroy();
            }
        }
    };

    global.Fruit = Fruit;

})(this);
