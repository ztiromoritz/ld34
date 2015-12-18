;
(function (global) {

    var OVERALL_GROWTH_SPEED = 0.5;

    var Vect = Garfunkel.Vect;
    var Segment = Garfunkel.Segment;
    var Triangle = Garfunkel.Triangle;

    var Branch = function (segment, parent, depth) {
        this.segment = segment;
        this.direction = 0;
        this.growth = 20 * Math.max(1,(4-depth)) + 20 * Math.random();
        this.growthSpeed = (0.3 + Math.random() * 0.2) * OVERALL_GROWTH_SPEED;
        //this.deltaR = 0;
        //this.moveTriangle = null;
        this.children = [];
        this.forked = false;
        this.hasFruit = false;
        this.fruits = [];
        if (parent) {
            this.initialAngle = this.segment.angle(parent.segment.getConnection());
        } else {
            this.initialAngle = this.segment.angle();
        }
    };

    Branch.prototype.addChild = function (branch) {
        //segment
        this.children.push(branch);
        this.connectChildren();
    };

    Branch.prototype.addSprite = function (sprite, position) {
        this.fruits.push({
            sprite: sprite,
            position: position
        });
    };


    Branch.prototype.updateFruits = function () {
        var self = this;
        _.forEach(this.fruits, function (fruit) {
            var p = self.segment.getPoint(fruit.position);
            fruit.sprite.x = p.x;
            fruit.sprite.y = p.y;
        });
    };

    Branch.prototype.growFruits = function (depth, spriteFactory) {
        if (!this.hasFruit && Math.random() < 0.000001 * depth * depth * depth) {
            this.hasFruit = true;
            var fruit = spriteFactory();
            fruit.pling();
            this.addSprite(fruit, Math.random());
        }
    };


    Branch.prototype.grow = function (depth, parent, callback) {
        if (!this.forked) {
            var v = this.segment.getConnection().normalize().mul(this.growthSpeed);
            this.segment.p2.add(v);
            if (this.segment.length() > this.growth ) {
                if (Math.random() < 3 / depth) {
                    var branch1 = new Branch(new Segment(this.segment.p2.clone(),
                            this.segment.getConnection().normalize().rotateTo(v.angle() + 0.4).add(this.segment.p2))
                        , this, depth);
                    if (callback)
                        callback(branch1);
                    this.addChild(branch1);
                }
                if (Math.random() < 3 / depth) {
                    var branch2 = new Branch(new Segment(this.segment.p2.clone(),
                            this.segment.getConnection().normalize().rotateTo(v.angle() - 0.4).add(this.segment.p2)),
                        this, depth);
                    if (callback)
                        callback(branch2);
                    this.addChild(branch2);
                }
                this.forked = true;
            }
        }

    };

    Branch.prototype.goDirection = function () {
        _.forEach(this.children, function (child) {
            child.segment.rotate(child.direction);
        });
    };

    var TRUNK = new Vect(0, -1);
    var TRUNK_ANGLE = TRUNK.angle();
    var ROOT = new Vect(SEED_X,SEED_Y);
    var INERTIA = 0.2;
    Branch.prototype.correct = function () {
        //Behandlung für den stamm
        //Kann man bestimmt intelligenter auch in connectChildren machen
        var deltaInit = TRUNK_ANGLE - this.segment.angle();
        var rotateCorrect = Math.min(1, (deltaInit * deltaInit) / (Math.PI * Math.PI) );
        this.segment.rotate(deltaInit * rotateCorrect);
    };

    Branch.prototype.connectChildren = function () {
        var self = this;

        _.forEach(this.children, function (child) {

            var moveTriangle = new Triangle(ROOT, self.segment.p2, child.segment.p1);
            var deltaR = moveTriangle.angleA();
            var delta = self.segment.p2.clone().sub(child.segment.p1);


            self.direction = deltaR * (1-INERTIA) + self.direction * INERTIA;

            //Connect branch with parent
            child.segment.translate(delta);


            //Rotate like parent
            //child.segment.rotate(self.direction);
            //child.segment.rotate(deltaR);


            //zurück federn
            var deltaInit = child.initialAngle - child.segment.angle(self.segment.getConnection());
            var rotateCorrect = Math.min(1, (deltaInit * deltaInit) / (Math.PI * Math.PI)) * 1.5;
            child.segment.rotate(deltaInit * rotateCorrect);


            /*
            if (Math.abs(delta.lengthSq()) > 0.01) {
                if (Math.random() > 0.5) {
                    if (self.fruits.length > 0) {
                        var fruit = self.fruits[0];
                        SND.pp.play();
                        fruit.sprite.connected = false;
                        self.fruits.splice(0, 1);
                    }
                }
            }*/

            /**
            if (Math.abs(delta.lengthSq()) > 0.001) {
                if (Math.random() > 0.1) {
                    if (self.fruits.length > 0) {
                        var fruit = self.fruits[0];
                        SND.pp.play();
                        fruit.sprite.connected = false;
                        self.fruits.splice(0, 1);
                    }
                }
            }*/

            /*
            child.deltaR = deltaR;
            child.direction = child.direction - deltaR * 1.9;
            child.segment.rotate(child.direction);
            //
            child.direction = child.direction * 0.6; //alte richtung
            child.deltaR = child.deltaR * 0.99999;   //bewegung des elter
            child.direction = child.direction + deltaR;
            */

        });
    };

    Branch.prototype.forEach = function (callbackBefore, callbackAfter, parent, depth) {
        depth = depth || 0;
        depth++;
        if (callbackBefore)
            callbackBefore(this, parent, depth);
        _.forEach(this.children, function (child) {
            child.forEach(callbackBefore, callbackAfter, child, depth);
        });
        if (callbackAfter)
            callbackAfter(this, parent, depth);
    };


    var Tree = function (branch) {
        this.root = branch;
    };

    global.Branch = Branch;
    global.Tree = Tree;

})(this);
