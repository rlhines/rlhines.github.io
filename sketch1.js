const particles = [];
let noiseOffset;
let pg1;
let angle1Random, angle2Random, offsetXRandom, offsetYRandom;

let radius;
let rows, cols;
let treeChars;
let spacing;
let treeCharsList = [
  ['|||', '--'],
  ['-_', ''],
  ['---'],
  ['', '-', '', '|||'],
];
let focalPoints;
let smear1, smear2;
let numPoints;
let shapeIntersect1;
let shapeIntersect2;
let shapeCoeff1;
let shapeCoeef2;

const minX = 0;
const maxX = 600;
const minY = 0;
const maxY = 400;

let purples= [
  "#9370DB", "#663399", "#8A2BE2", "#9400D3", "#9932CC", 
  "#8B008B", "#800080", "#4B0082", "#6A5ACD", "#483D8B", 
  "#7B68EE"
]
let greens=[
  "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", 
  "#6B8E23", "#66CDAA", "#8FBC8B", "#20B2AA", "#008B8B", 
  "#008080"
];
let blues=[
  // "#4682B4", "#87CEFA", "#00BFFF", "#1E90FF", "#6495ED", 
  "#4169E1", "#0000FF", "#0000CD", "#00008B", "#191970"
];
let browns=[
  "#F4A460","#B8860B","#CD853F","#D2691E","#8B4513",
  "#A0522D"
];
let darks=[
  "#333333", "#4A4A4A", "#555555", "#666666", "#1C1C1C"
]
let palettes = [
  purples, greens, purples, browns
]

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateFocalPoints(numPoints, minX, maxX, minY, maxY) {
  const focalPoints = [];

  while (focalPoints.length < numPoints) {
    const x = randomInRange(minX + radius, maxX - radius);
    const y = randomInRange(minY + radius, maxY - radius);
    const newPoint = { x, y, radius };

    if (!isOverlapping(newPoint, focalPoints)) {
      focalPoints.push(newPoint);
    } else {
      // If overlapping, reduce the radius and try again
      radius *= 0.9;
    }
  }

  return focalPoints;
}

function resetSketch() {
    // Reset and reinitialize your sketch variables here
    setup();
  }

function isOverlapping(newPoint, points) {
  for (let point of points) {
    const dx = newPoint.x - point.x;
    const dy = newPoint.y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < newPoint.radius + point.radius + 25) {
      // Adding 10 to ensure some minimum spacing between shapes
      return true;
    }
  }
  return false;
}


function generateColor(index) {
  const hue = map(index, 0, focalPoints.length, 0, 255);
  return [hue, 0, 0, 255];
}

function setup() {
  frameRate(30);
  createCanvas(600, 400)
  colorMode(HSB, 255);
  pg1 = createGraphics(width, height);
  textSize(random(10, 50));
  textAlign(CENTER, CENTER);
  noiseOffset = createVector(random(1000), random(1000));
  color1 = random(random(palettes));
  color2 = random(random(palettes));
  color3 = random(random(palettes));
  angle1Random = random(0, TWO_PI);
  angle2Random = random(0, TWO_PI);
  offsetXRandom = random(0, 10);
  offsetYRandom = random(0, 10);
  radius = random(20, 70); 
  const index1 = floor(random(treeCharsList.length));
  treeChars = treeCharsList[index1];
  spacing = radius * 1.5;
  rows = floor(500 / radius);
  cols = floor(500 / radius);
  smear1 = random(0.0001, 0.005)
  smear2 = random(0.001, 0.05);
  shapeIntersect1 = floor(random(1,2));
  shapeIntersect2 = floor(random(1,2));
  shapeCoeff1 = random(0.1, 0.5);
  shapeCoeff2 = random(0.1, 0.5);
  
  numPoints = floor(random(10,20))
  focalPoints = generateFocalPoints(
    numPoints, minX, maxX, minY, maxY
  );
}

function draw() {
  background(0);
  drawShapes();
  for (let i=1; i<10; i++){
    r1 = randomGaussian(width/2, width/2);
    r2 = randomGaussian(height/2, height/2),
    pg1.stroke(color1);
    pg1.ellipse(r1/2, r2/2, 0.0001, 0.001);
    pg1.stroke(color2);
    pg1.ellipse(r1/2, r2/2, 0.0001, 0.001);
    image(pg1,0,0);
    let bx = log(millis()*smear1)*smear2;
    pg1.image(pg1,bx,0.15);
  }
  
}

function drawShapes() {
    if (!treeChars) {
    return;
  }
  for (let i = 0; i < focalPoints.length; i++) {
    const focalPoint = focalPoints[i];
    const fillColor = generateColor(i);
    pg1.push();
    pg1.translate(focalPoint.x, focalPoint.y);
    pg1.rotate(PI / 6); // Rotate the hexagon slightly
    pg1.fill(fillColor);

    for (let j = 0; j < 6; j++) {
      // Add the random angles to angle1 and angle2, but limit the range to ensure space in the middle
      const angle1 = map(j, 0, 6, 0, TWO_PI) + angle1Random % (PI / 4);
      const angle2 = map(j + 1, 0, 6, 0, TWO_PI) + angle2Random % (PI / 4);
      const r1 = focalPoint.radius * (
        shapeIntersect1 + shapeCoeff1 * cos(2 * angle1)
      );           
      const r2 = focalPoint.radius * (
        shapeIntersect2 + shapeCoeff2 * cos(2 * angle2)
      );
      const x1 = r1 * cos(angle1);
      const y1 = r1 * sin(angle1);
      const x2 = r2 * cos(angle2);
      const y2 = r2 * sin(angle2);

      const numChars = 15;
      for (let k = 0; k < numChars; k++) {
        const t = map(k, 0, numChars, 0, 1);
        const x = lerp(x1, x2, t);
        const y = lerp(y1, y2, t);
        const index = floor(random(treeChars.length));
        const char = treeChars[index];

        pg1.text(char, x, y);
      }
    }
    pg1.pop();
  };
}