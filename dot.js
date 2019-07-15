class Dot {
  constructor() {
    this.vector = {
      x: 0,
      y: 0
    };
    this.color = {
      r: 127, // Math.floor(Math.random() * 256), //127 + Math.floor(Math.random() * 127),
      g: 127, // Math.floor(Math.random() * 256), //127 + Math.floor(Math.random() * 127),
      b: 127, // Math.floor(Math.random() * 256) //127 + Math.floor(Math.random() * 127)
    };
    this.age = 0;
    this.energy = 10;////Math.random() * 10;
    this.tickRate = 0.02;
    this.nearestDot = null;
    this.nearestFood = null;
    this.x = Math.random() * ctx.canvas.width;
    this.y = Math.random() * ctx.canvas.height;
    this.brain = new Brain();
    this.population = [];
    this.consumed = false;
    this.children = 0;
    this.generation = 0;
    this.nearbyDistance = 25;
    this.nearbyDotCount = 0;
  }

  CheckDots(pop) {
    let smallestdistance = 100000000;
    this.nearbyDotCount = 0;
    for (
      let closeIndex = 0; closeIndex < pop.dots.length; closeIndex++
    ) {
      if (this !== pop.dots[closeIndex]) {
        // check closeness
        const distance = this.GetDistance(pop.dots[closeIndex]);
        if (distance < this.nearbyDistance) {
          this.nearbyDotCount++;
        }

        if (distance < smallestdistance) {
          smallestdistance = distance;
          this.nearestDot = pop.dots[closeIndex];
        }
      }
    }
  }

  CheckDeath() {
    return this.Consumed() || this.energy < 0 || this.WallDeath();
  }

  CopyColor(dotToCopy) {
    do {
      this.color.r = this.ColorBoundCheck(dotToCopy.color.r + Math.floor((Math.random() * 32) - 16));
      this.color.g = this.ColorBoundCheck(dotToCopy.color.g + Math.floor((Math.random() * 32) - 16));
      this.color.b = this.ColorBoundCheck(dotToCopy.color.b + Math.floor((Math.random() * 32) - 16));
    } while ((0.2126 * this.color.r + 0.7152 * this.color.g + 0.0722 * this.color.b) < 64);
  }

  ColorBoundCheck(color) {
    if (color > 255) { return 255; }
    if (color < 0) { return 0; }
    return color;
  }

  Consumed() {
    if (this.nearestDot !== null) {
      const dx = this.x - this.nearestDot.x;
      const dy = this.y - this.nearestDot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 1) {
        if (this.energy < this.nearestDot.energy) {
          this.energy = -2;
          this.consumed = true;
          return true;
        } else {
          this.children++;
          this.energy += this.nearestDot.energy;
          // if (this.energy > 100) {
          //   this.energy = 100;
          // }
          return false;
        }
      }
    }
    return false;
  }

  DifferentColor(otherColor) {
    return (
      this.color.r !== otherColor.r ||
      this.color.g !== otherColor.g ||
      this.color.b !== otherColor.b
    );
  }

  DoMovement(cWidth, cHeight) {
    this.ThinkAboutStuff(cWidth, cHeight);
    let lastLayerIndex = this.brain.layers.length - 1;
    let lastLayer = this.brain.layers[lastLayerIndex];
    let vectorModifier = 1;// - (this.age * 0.001);
    this.vector.x += ((lastLayer[5].value + lastLayer[6].value + lastLayer[7].value) - (lastLayer[0].value + lastLayer[1].value + lastLayer[2].value)) / 3;
    this.vector.y += ((lastLayer[2].value + lastLayer[4].value + lastLayer[7].value) - (lastLayer[0].value + lastLayer[3].value + lastLayer[5].value)) / 3;
    this.x += (this.vector.x * vectorModifier);
    this.y += (this.vector.y * vectorModifier);

    const lastVector = Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y) / 1000;
    this.energy -= this.tickRate + lastVector;// + (this.age/10000);
    //this.energy -= (lastVector  * (1 + (this.age/10000))) + (this.age/10000);
    //this.energy -= this.tickRate + (this.tickRate / this.age) + (lastVector  * (1 + (this.age/1000)));// + (this.age/10000);
    this.age++;
  }

  GetDistance(otherDot) {
    const dx = this.x - otherDot.x;
    const dy = this.y - otherDot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
  }

  GetInputs(cWidth, cHeight) {
    this.brain.layers[0] = [];

    // previous outputs
    let outputLayer = this.brain.layers.length - 1;
    let outputLayerLen = this.brain.layers[outputLayer].length
    for (let index = 0; index < outputLayerLen; index++) {
      this.brain.layers[0].push({
        value: this.brain.layers[outputLayer][index].value
      });
    }

    // know thyself
    this.brain.layers[0].push({
      value: this.age
    });
    this.brain.layers[0].push({
      value: this.energy
    });
    this.brain.layers[0].push({
      value: this.vector.x
    });
    this.brain.layers[0].push({
      value: this.vector.y
    });

    // closest dot that it can see. if any.
    if (this.GetDistance(this.nearestDot) < this.nearbyDistance) {
      this.brain.layers[0].push({
        value: this.nearestDot.x - this.x
      });
      this.brain.layers[0].push({
        value: this.nearestDot.y - this.y
      });
      this.brain.layers[0].push({
        value: this.nearestDot.energy - this.energy
      });

      this.brain.layers[0].push({
        value: Math.abs(this.color.r - this.nearestDot.color.r)
      });
      this.brain.layers[0].push({
        value: Math.abs(this.color.g - this.nearestDot.color.g)
      });
      this.brain.layers[0].push({
        value: Math.abs(this.color.b - this.nearestDot.color.b)
      });
    } else {
      // can't see anything.
      this.brain.layers[0].push({ value: 0 });
      this.brain.layers[0].push({ value: 0 });
      this.brain.layers[0].push({ value: 0 });
      this.brain.layers[0].push({ value: 0 });
      this.brain.layers[0].push({ value: 0 });
      this.brain.layers[0].push({ value: 0 });
    }

    // what's around me
    this.brain.layers[0].push({
      value: this.nearbyDotCount
    });

    const canvasH = cHeight * 2;
    const canvasW = cWidth * 2;
    // near the left edge.
    this.brain.layers[0].push({
      value: this.x > this.nearbyDistance ? 0 : this.nearbyDistance - this.x
    });

    // near the right edge.
    this.brain.layers[0].push({
      value: (canvasW - this.x) > this.nearbyDistance ? 0 : canvasW - this.x
    });


    // near the top edge.
    this.brain.layers[0].push({
      value: this.y > this.nearbyDistance ? 0 : this.nearbyDistance - this.y
    });

    // near the bottom edge.
    this.brain.layers[0].push({
      value: (canvasH - this.y) > this.nearbyDistance ? 0 : canvasH - this.y
    });

    // // percentage of screen from center. horizontally
    // this.brain.layers[0].push({
    //   value: (this.x - cWidth) / cWidth
    // });

    // // percentage of screen from center. vertically
    // this.brain.layers[0].push({
    //   value: (this.y - cHeight) / cHeight
    // });

    // // the entire last layer before the output. wtf is this?
    // let lastLayer = this.brain.layers.length - 2;
    // let lastLayerLen = this.brain.layers[lastLayer].length;
    // for (let index = 0; index < lastLayerLen; index++) {
    //   this.brain.layers[0].push({
    //     value: this.brain.layers[lastLayer][index].value
    //   });
    // }
  }

  ThinkAboutStuff(cWidth, cHeight) {
    this.GetInputs(cWidth, cHeight);
    this.brain.ProcessLayers();
  }

  WallDeath() {
    return (
      this.x > ctx.canvas.width ||
      this.x < 1 ||
      this.y > ctx.canvas.height ||
      this.y < 1
    );
  }
}