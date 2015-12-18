/**
 * Created by mo on 13.12.15.
 */

;
(function (global) {

    var Hedgehog = function (game, x, y) {
        Phaser.Sprite.call(this, game, x, y, 'hedgehog');
        game.physics.arcade.enable(this);
        //this.scale.x = -1; //flipped
        this.anchor.setTo(0.5, 1); //so it flips around its middle
        this.body.setSize(40, 28, 2, 0);

        this.animations.add('walk', [0, 1, 2, 3], 6, true);
        this.animations.play('walk');

        //this.body.mass = 1;
        this.body.immovable = true;
        this.body.move = false;

        this.direction = 0;
    };

    Hedgehog.prototype = Object.create(Phaser.Sprite.prototype);
    Hedgehog.prototype.constructor = Hedgehog;

    Hedgehog.prototype.init = function () {
        if (Math.random() > 0.5) {
            this.x = -50 - (400 * Math.random());
            this.scale.x = -1;
            this.direction = 1;
        } else {
            this.x = WIDTH + 50 + (400 * Math.random());
            this.direction = -1;
            this.scale.x = 1;
        }

    };


    Hedgehog.prototype.update = function () {
        this.x += this.direction * 0.5;

        if ((this.direction === 1 && this.x > WIDTH + 50)
            || (this.direction === -1 && this.x < - 50)) {
            this.init();
        }
    };

    global.Hedgehog = Hedgehog;

})(this);
