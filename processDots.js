let cvs = document.getElementById("gridCanvas");
let ctx = cvs.getContext("2d");

const times = [];
let fps;

ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let centerX = ctx.canvas.width / 2;
let centerY = ctx.canvas.height / 2;
let pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);
let density = 100000;

let lowerLimit = ((ctx.canvas.width * ctx.canvas.height) / 10000) * 1;
let upperLimit = ((ctx.canvas.width * ctx.canvas.height) / 10000) * density;

let population = {
  data: {
    mostEnergy: 0,
    mostEnergyIndex: 0,
    highestAverage: 0,
    averageAge: 0,
    oldestAge: 0,
    oldestAgeIndex: 0,
    mostChildren: 0,
    mostChildrenIndex: 0
  },
  dots: []
};

function AddDots(dotsToAdd) {
  for (let i = 0; i < dotsToAdd; i++) {
    population.dots.push(new Dot());

    //if (i < dotsToAdd * 0.90) { //===0) {
    population.dots[i].brain.Restore();
    population.dots[i].brain.Mutate();
    //}
  }
}

function CopyDot(dotIndex, copyDot, offspring) {
  population.dots[dotIndex].brain.Copy(
    copyDot.brain
  );

  population.dots[dotIndex].CopyColor(copyDot);

  let r = (Math.random() * 25);
  const a = Math.random() * 6.28;
  population.dots[dotIndex].x = Math.floor(r * Math.cos(a) + copyDot.x);
  population.dots[dotIndex].y = Math.floor(r * Math.sin(a) + copyDot.y);
  if (population.dots[dotIndex].x < 0) { population.dots[dotIndex].x = 0; }
  if (population.dots[dotIndex].x > ctx.canvas.width) { population.dots[dotIndex].x = ctx.canvas.width; }
  if (population.dots[dotIndex].y < 0)  {population.dots[dotIndex].y = 0; }
  if (population.dots[dotIndex].y > ctx.canvas.height) { population.dots[dotIndex].y = ctx.canvas.height; }


  population.dots[dotIndex].brain.Mutate();

  population.dots[dotIndex].vector.x = 0;
  population.dots[dotIndex].vector.y = 0;
  population.dots[dotIndex].energy = 5;
  population.dots[dotIndex].age = 0;
  population.dots[dotIndex].children = 0;
  population.dots[dotIndex].consumed = false;
  population.dots[dotIndex].generation++;
}

function DoTheThings() {
  centerX = ctx.canvas.width / 2;
  centerY = ctx.canvas.height / 2;

  let totalEnergy = 0;
  population.data.oldestAge = 0;
  population.data.mostEnergy = 0;
  population.data.mostChildren = 0;

  for (let i = 0; i < population.dots.length; i++) {
    totalEnergy += population.dots[i].energy;
    population.dots[i].CheckDots(population);

    population.dots[i].DoMovement(centerX, centerY);

    if (population.dots[i].energy > population.data.mostEnergy) {
      population.data.mostEnergyIndex = i;
      population.data.mostEnergy = population.dots[i].energy;
    }

    if (population.dots[i].children > population.data.mostChildren) {
      population.data.mostChildrenIndex = i;
      population.data.mostChildren = population.dots[i].children;
    }

    if (population.dots[i].age > population.data.oldestAge) {
      population.data.oldestAgeIndex = i;
      population.data.oldestAge = population.dots[i].age;
    }
  }

  let averageEnergy = totalEnergy / population.dots.length;
  if (averageEnergy > population.data.highestAverage) {
    population.data.highestAverage = averageEnergy;
  }

  for (
    let dotIndex = 0; dotIndex < population.dots.length; dotIndex++
  ) {
    if (population.dots[dotIndex].CheckDeath() === true) {
      if (population.dots[dotIndex].children >= population.data.mostChildren) {
        population.dots[dotIndex].brain.Save();
      }

      let copyDot = {};

      // got et
      if (population.dots[dotIndex].consumed === true) {
        copyDot = population.dots[dotIndex].nearestDot;
        CopyDot(dotIndex, copyDot, true);
      } else {
        let copyIndex = Math.floor(Math.random() * population.dots.length);
        copyDot = population.dots[copyIndex];
        CopyDot(dotIndex, copyDot, false);
      }

    }
  }

  if (population.dots.length < upperLimit && fps > 40) {
    AddDots(1);
  }
}

function DrawGrid() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  DoTheThings();

  // clear screen
  pixels = ctx.createImageData(ctx.canvas.width, ctx.canvas.height);

  ////let index = 0;

  // draw
  for (let i = 0; i < population.dots.length; i++) {
    let x = Math.floor(population.dots[i].x);
    let y = Math.floor(population.dots[i].y);

    ////let dotSize = 1;

    if (!(
      x < 1 ||
      y < 1 ||
      x > ctx.canvas.width ||
      y > ctx.canvas.height
    )) {

      PlacePixel(x - 1, y - 1, population.dots[i].color, 64);
      PlacePixel(x, y - 1, population.dots[i].color, 32);
      PlacePixel(x + 1, y - 1, population.dots[i].color, 64);

      PlacePixel(x - 1, y, population.dots[i].color, 32);
      PlacePixel(x, y, population.dots[i].color, 0);
      PlacePixel(x + 1, y, population.dots[i].color, 32);

      PlacePixel(x - 1, y + 1, population.dots[i].color, 64);
      PlacePixel(x, y + 1, population.dots[i].color, 32);
      PlacePixel(x + 1, y + 1, population.dots[i].color, 64);

    }
  }

  //DrawBrain(population.data.oldestAgeIndex, 30);
  //DrawBrain(population.data.mostChildrenIndex, 260);

  ctx.putImageData(pixels, 0, 0);

  const now = performance.now();
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;

  ctx.fillStyle = "white";
  //ctx.fillText("fps: " + fps + ", DotCount: " + population.dots.length, 20, 15);

  ctx.fillStyle = "white";
  //ctx.fillText("oldest: " + population.data.oldestAgeIndex + " - " + population.data.oldestAge + " - " + population.dots[population.data.oldestAgeIndex].generation + " - " + population.dots[population.data.oldestAgeIndex].energy.toFixed(2), 20, 30);

  ctx.fillStyle = "lightgreen";
  //ctx.fillText("most prolific: " + population.data.mostChildrenIndex + " - " + population.data.mostChildren + " - " + population.dots[population.data.mostChildrenIndex].generation + " - " + population.dots[population.data.mostChildrenIndex].energy.toFixed(2), 20, 260);

  ctx.stroke();


  //ListDetails();
  //CircleDot(population.data.oldestAgeIndex, "white", 25);
  //CircleDot(population.data.mostChildrenIndex, "green", 20);

  // if (fps < 24 && population.data.mostChildrenIndex != population.dots.length - 1 && population.data.oldestAgeIndex != population.dots.length - 1) {
  //   population.dots.splice(population.dots.length - 1);
  // }

  // if (fps > 40 && population.dots.length < ((ctx.canvas.width * ctx.canvas.height) / 10000) * density) {
  //   AddDots(1);
  // }

  setTimeout(function () {
    DrawGrid();
  }, 1);

  return;
}

function ListDetails() {
  const oldestDot = population.dots[population.data.oldestAgeIndex];
  ctx.fillText("children: " + oldestDot.children.toFixed(2), 10, 240);
  const inputLayer = oldestDot.brain.layers[0];
  for (let inputIndex = 0; inputIndex < inputLayer.length; inputIndex++) {
    ctx.fillText("input " + inputIndex + ": " + inputLayer[inputIndex].value.toFixed(2), 10, 260 + (20 * inputIndex));
  }

}

function CircleDot(dotIndex, color, size) {
  const oldDot = population.dots[dotIndex];
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.arc(oldDot.x, oldDot.y, size, 0, 2 * Math.PI);
  ctx.stroke();
}

function DrawBrain(dotIndex, offset) {
  const scale = 1.5;
  const squareSize = scale * 5;
  const brainSize = 100 * scale;

  const dot = population.dots[dotIndex];
  const brain = dot.brain;
  const layerSize = brainSize / brain.layers.length;
  for (let layerIndex = 1; layerIndex < brain.layers.length - 1; layerIndex++) {
    const layer = brain.layers[layerIndex];
    const neuronSize = brainSize / layer.length;
    for (let neuronIndex = 0; neuronIndex < layer.length; neuronIndex++) {
      const neuronValue = layer[neuronIndex].value;
      let upshift = (brainSize - ((squareSize * layer.length))) / (scale * layer.length);
      PlaceValueSquare(Math.floor(layerIndex * layerSize), Math.floor((1 + neuronIndex) * neuronSize + offset - upshift), dot.color, neuronValue, squareSize);
    }
  }

  const lastLayer = dot.brain.layers[brain.layers.length - 1];
  // // PlaceValueSquare(175, 100 + offset, dot.color, lastLayer[1].value, 10);  // left
  // // PlaceValueSquare(225, 100 + offset, dot.color, lastLayer[0].value, 10);  //right
  // // PlaceValueSquare(200, 75 + offset, dot.color, lastLayer[3].value, 10);  // up
  // // PlaceValueSquare(200, 125 + offset, dot.color, lastLayer[2].value, 10); // down

  const xoffset = Math.floor(brainSize + (squareSize * 2));
  const yoffset = Math.floor(offset + (brainSize / 2));
  const dSize = Math.floor(squareSize * 3);
  PlaceValueSquare(xoffset - dSize, yoffset - dSize, dot.color, lastLayer[0].value, squareSize);
  PlaceValueSquare(xoffset, yoffset - dSize, dot.color, lastLayer[1].value, squareSize);
  PlaceValueSquare(xoffset + dSize, yoffset - dSize, dot.color, lastLayer[2].value, squareSize);

  PlaceValueSquare(xoffset - dSize, yoffset, dot.color, lastLayer[3].value, squareSize);
  PlaceValueSquare(xoffset + dSize, yoffset, dot.color, lastLayer[4].value, squareSize);

  PlaceValueSquare(xoffset - dSize, yoffset + dSize, dot.color, lastLayer[5].value, squareSize);
  PlaceValueSquare(xoffset, yoffset + dSize, dot.color, lastLayer[6].value, squareSize);
  PlaceValueSquare(xoffset + dSize, yoffset + dSize, dot.color, lastLayer[7].value, squareSize);

  const xVector = (lastLayer[0].value - lastLayer[1].value) * 3;
  const yVector = (lastLayer[2].value - lastLayer[3].value) * 3;

  PlaceSquare(Math.floor(dot.vector.x + xoffset), Math.floor(dot.vector.y + yoffset), dot.color, squareSize);

}

function PlacePixel(x, y, color, d) {
  const index = (x + y * ctx.canvas.width) * 4;
  pixels.data[index] = color.r - d;
  pixels.data[index + 1] = color.g - d;
  pixels.data[index + 2] = color.b - d;
  pixels.data[index + 3] = 255;
}

function PlaceValueSquare(x, y, dotColor, dotValue, s) {
  const color = {
    r: (dotColor.r / 2) + (127 * dotValue),
    g: (dotColor.g / 2) + (127 * dotValue),
    b: (dotColor.b / 2) + (127 * dotValue)
  };
  for (let xx = x; xx < x + s; xx++) {
    for (let yy = y; yy < y + s; yy++) {
      PlacePixel(xx, yy, color, 0);
    }
  }
}

function PlaceSquare(x, y, color, s) {
  for (let xx = x; xx < x + s; xx++) {
    for (let yy = y; yy < y + s; yy++) {
      PlacePixel(xx, yy, color, 0);
    }
  }
}


AddDots(100);
for (let i = 0; i < 120; i++) {
  times.push(performance.now());
}
DrawGrid();