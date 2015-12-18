;
(function (global) {


    Phaser.Filter.Glow = function (game) {
        Phaser.Filter.call(this, game);

        this.fragmentSrc = [
            "precision lowp float;",
            "varying vec2 vTextureCoord;",
            "varying vec4 vColor;",
            'uniform sampler2D uSampler;',

            'void main() {',
            'vec4 sum = vec4(0);',
            'vec2 texcoord = vTextureCoord;',
            'for(int xx = -4; xx <= 4; xx++) {',
            'for(int yy = -3; yy <= 3; yy++) {',
            'float dist = sqrt(float(xx*xx) + float(yy*yy));',
            'float factor = 0.0;',
            'if (dist == 0.0) {',
            'factor = 2.0;',
            '} else {',
            'factor = 2.0/abs(float(dist));',
            '}',
            'sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;',
            '}',
            '}',
            'gl_FragColor = sum * 0.025 + texture2D(uSampler, texcoord);',
            '}'
        ];
    };

    Phaser.Filter.Glow.prototype = Object.create(Phaser.Filter.prototype);
    Phaser.Filter.Glow.prototype.constructor = Phaser.Filter.Glow;


    // Converts from degrees to radians.
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180;
    };

    // Converts from radians to degrees.
    Math.degrees = function (radians) {
        return radians * 180 / Math.PI;
    };


    var Segment = Garfunkel.Segment;


    var game = new Phaser.Game(WIDTH, HEIGHT,
        Phaser.AUTO,
        'game',
        {preload: preload, create: create, update: update},
        true, //transparent
        true   //antialias
    );


    var tree;
    var treeGroup, fruitGroup, hedgeGroup;
    var debug = false;
    var score = 0;

    function preload() {
        game.load.spritesheet('hedgehog', 'hedgehog.png', 48, 48, 16);
        game.load.audio('snd1', 'sound/snd1.wav');
        game.load.audio('snd2', 'sound/snd2.wav');
        game.load.audio('snd3', 'sound/snd3.wav');
        game.load.audio('snd4', 'sound/snd4.wav');
        game.load.audio('snd5', 'sound/snd5.wav');
        game.load.audio('snd6', 'sound/snd6.wav');
        game.load.audio('snd7', 'sound/snd7.wav');
        game.load.audio('snd8', 'sound/snd8.wav');
        game.load.audio('snd9', 'sound/snd9.wav');
        game.load.audio('pp', 'sound/pp.wav');
        game.load.audio('smtch', 'sound/smtch.wav');
        game.load.audio('song', 'sound/song.wav');
        game.load.onFileComplete.add(function (progress, key, success) {
            $('#points').html(progress+'%');
        }, game);
    }


    var SND = [];
    global.SND = SND;
    function create() {

        $('#points').text('score: '+score);
        for(var s=0;s<9;s++){
            var sound = game.add.audio('snd'+(s+1));
            sound.allowMultiple = true;
            SND.push(sound);
        }
        SND.pp = game.add.audio('pp');
        SND.pp.allowMultiple = true;
        SND.smtch = game.add.audio('smtch');
        SND.smtch.allowMultiple = true;
        SND.song = game.add.audio('song');
        SND.song.allowMultiple = true;

        SND.song.loopFull(0.5);



        game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(function(){
            console.log('D', debug);
            debug = !debug;
            game.config.enableDebug = debug;
        },this);


        game.physics.startSystem(Phaser.Physics.ARCADE);

        treeGroup = game.add.group();
        fruitGroup = game.add.group();
        hedgeGroup = game.add.group();

        fruitGroup.filters = [game.add.filter('Glow')];
        //treeGroup.filters = [ game.add.filter('Glow') ];
        //hedgeGroup.filters = [game.add.filter('Glow') ];

        var h1 = new Hedgehog(game, 25, 550);
        h1.init();
        hedgeGroup.add(h1);

         var h2 = new Hedgehog(game,25,560);
         h2.init();
        hedgeGroup.add(h2);

        var h3 = new Hedgehog(game, 25, 570);
        h3.init();
        hedgeGroup.add(h3);

        var h4 = new Hedgehog(game,25,580);
         h4.init();
        hedgeGroup.add(h4);

        var h5 = new Hedgehog(game, 25, 590);
        h5.init();
        hedgeGroup.add(h5);

        /*
         fruitGroup.create(230,300,'hedgehog',5);
         fruitGroup.create(250,300,'hedgehog',6);
         fruitGroup.create(280,300,'hedgehog',7);
         fruitGroup.create(300,300,'hedgehog',8);
         fruitGroup.create(320,300,'hedgehog',9);
         */


        tree = new Branch(Segment.fromArray([SEED_X, SEED_Y, SEED_X, SEED_Y - 2]),null,0);
        tree.forEach(function (branch, parent, depth) {
            var graphics = game.add.graphics(0, 0);
            graphics.lineStyle(3, 0x000000, 1);
            graphics.moveTo(branch.segment.p1.x, branch.segment.p1.y);
            var connection = branch.segment.getConnection();
            //graphics.bezierCurveTo( connection.x+3, connection.y,  connection.x, connection.y+3, connection.x, connection.y)
            graphics.lineTo(connection.x, connection.y);
            treeGroup.add(graphics);
            branch._graphics = graphics;
        });
    }

    function update() {

        game.physics.arcade.overlap(fruitGroup, hedgeGroup, function(fruit, hedge) {
            fruit.kill();
            score ++;
            console.log(score);
            SND.smtch.play();
            $('#points').text('score: '+score);
            //TODO: Play sound
            //TODO: visual effect

        });


        function testDropFruit(branch){
            if(Math.random() <0.05 && branch.fruits.length > 0){
                console.log('drop');
                var fruit = branch.fruits[0];
                SND.pp.play();
                fruit.sprite.connected = false;
                branch.fruits.splice(0, 1);
                branch.hasFruit = false;
            }
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            tree.segment.rotate(-Math.radians(2));
            tree.forEach(function (branch, parent, depth) {
                testDropFruit(branch);
                //branch.segment.rotate(-Math.radians(1 / 100* depth));
            });
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            tree.segment.rotate(+Math.radians(2));
            tree.forEach(function (branch, parent, depth) {
                testDropFruit(branch);
                //branch.segment.rotate(+Math.radians(1 / 100* depth));
            });
        }



        tree.forEach(function (branch, parent, depth) {
            branch.grow(depth, parent, function (newBranch) {
                var graphics = game.add.graphics(0, 0);
                graphics.lineStyle(2, 0x000000, 1);
                graphics.moveTo(branch.segment.p1.x, branch.segment.p1.y);
                var connection = branch.segment.getConnection();
                graphics.lineTo(connection.x, connection.y);
                treeGroup.add(graphics);
                newBranch._graphics = graphics;
            });
            branch.goDirection();
            branch.growFruits(depth,
                function () {
                    var fruit = new Fruit(game, -100, -100);
                    fruitGroup.add(fruit);
                    return fruit;
                }
            );
        }, function (branch, parent, depth) {
            branch.connectChildren();
            branch.updateFruits();
            branch._graphics.graphicsData[0].shape._points[0] = branch.segment.p1.x;
            branch._graphics.graphicsData[0].shape._points[1] = branch.segment.p1.y;
            branch._graphics.graphicsData[0].shape._points[2] = branch.segment.p2.x;
            branch._graphics.graphicsData[0].shape._points[3] = branch.segment.p2.y;
            branch._graphics.dirty = true;
            branch._graphics.clearDirty = true;
        });
        tree.correct();


        if (debug) {
            fruitGroup.forEach(function (item) {
                game.debug.body(item);
            });
            hedgeGroup.forEach(function (item) {
                game.debug.body(item);
            });

        }

    }


    global.game = game;

})(this);
