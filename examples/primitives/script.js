// Our Quadtree
const tree = new Quadtree({
    width: 640,
    height: 480,
    maxObjects: 4,
});


// Mouse cursor
// We only use this object to retrieve objects (it is not in the Quadtree)
const cursors = {
    rectangle: new Quadtree.Rectangle({
        x: 0,
        y: 0,
        width: 64,
        height: 64
    }),
    circle: new Quadtree.Circle({
        x: 0, 
        y: 0, 
        r: 48
    }),
    line: new Quadtree.Line({
        x1: 50, 
        y1: 50, 
        x2: 150,
        y2: 150,
        data: {
            x: 0,
            y: 0
        }
    })
};

let myCursor = cursors.rectangle;

// Keep track of mouseover state
let isMouseover = false;

// Our objects will be stored here
let myObjects = [];

// DOM and context
const canvas = document.getElementById('canvas'),
    addRectangle = document.querySelector('#addRectangle'),
    addCircle = document.querySelector('#addCircle'),
    addLine = document.querySelector('#addLine'),
    ctx = canvas.getContext('2d');

// EventListener for mousemove
canvas.addEventListener('mousemove', function(e) {
    
    isMouseover = true;
    
    // Position cursor at mouse position
    if(myCursor === cursors.line) {
        myCursor.data.x = e.offsetX;
        myCursor.data.y = e.offsetY;
    } else if(myCursor === cursors.circle) {
        myCursor.x = e.offsetX;
        myCursor.y = e.offsetY;
    } else {			
        myCursor.x = e.offsetX - (myCursor.width/2);
        myCursor.y = e.offsetY - (myCursor.height/2);	
    }
    
    // Reset myObjects check flag
    myObjects.forEach(obj => obj.data.check = false);
    
    // Retrieve all objects that share nodes with the cursor
    const candidates = tree.retrieve(myCursor);

    // Flag retrieved objects
    candidates.forEach(obj => obj.data.check = true);

    // Draw scene
    draw();
});
canvas.addEventListener('mouseout', function(e) {	
    isMouseover = false;

    // Reset myObjects check flag
    myObjects.forEach(obj => obj.data.check = false);

    // Draw scene
    draw();
});
document.getElementById('btnClear').addEventListener('click', handleClear);

document.querySelectorAll('button[id^="cursor-"]').forEach(button => {
    button.addEventListener('click', (e) => {
        const name = e.target.id.split('-')[1];
        if(cursors[name]) {
            myCursor = cursors[name];
        }
    });
});

// Add Rectangles
addRectangle.addEventListener('click', () => {

    // Each primitive requires geometry properties –
    // For Rectangle: x, y, width and height are required.
    const rect = new Quadtree.Rectangle({
        x: Math.random() * (canvas.width-32),
        y: Math.random() * (canvas.height-32),
        width: 4 + Math.random() * 32,
        height: 4 + Math.random() * 32,
        data: {
            check: false,
        },
    });

    // Insert the Rectangle in the Quadtree
    tree.insert(rect);

    // Store object in our array
    myObjects.push(rect);

    // Draw scene
    draw();
});

// Add Circle
addCircle.addEventListener('click', function addCircle() {

    // For Circle: x, y and r are required.
    const circle = new Quadtree.Circle({
        x: Math.random() * (canvas.width-32),
        y: Math.random() * (canvas.height-32),
        r: 4 + Math.random() * 16,
        data: {
            check: false,
        },
    });

    // Insert the Circle in the Quadtree
    tree.insert(circle);

    // Store object in our array
    myObjects.push(circle);

    // Draw scene
    draw();
});

// Add Line
addLine.addEventListener('click', () => {

    // For Line: x1, y1, x2 and y2 are required.
    const x1 = 8 + Math.random() * (canvas.width - 128);
    const y1 = 8 + Math.random() * (canvas.height - 128);
    const line = new Quadtree.Line({
        x1: x1,
        y1: y1,
        x2: x1 + Math.random() * 128,
        y2: y1 + Math.random() * 128,
        data: {
            check: false,
        },
    });

    // Insert the Line in the Quadtree
    tree.insert(line);

    // Store object in our array
    myObjects.push(line);

    // Draw scene
    draw();
});


// Clear the tree
function handleClear() {

    // Empty our array
    myObjects = [];

    // Empty our quadtree
    tree.clear();

    // Draw scene
    draw();
}

function draw() {

    // Clear the canvas
    ctx.clearRect(0, 0, 640, 480);
    
    drawObjects(myObjects, ctx);
    drawQuadtree(tree, ctx);

    if(isMouseover) {

        ctx.fillStyle = 'rgba(255,255,255,0.25)';

        if(myCursor === cursors.line) {
            const t = performance.now();
            myCursor.x1 = myCursor.data.x - 75;
            myCursor.y1 = myCursor.data.y - 75;
            myCursor.x2 = myCursor.data.x + 75;
            myCursor.y2 = myCursor.data.y + 75;

            ctx.save();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.moveTo(myCursor.x1, myCursor.y1);
            ctx.lineTo(myCursor.x2, myCursor.y2);
            ctx.stroke();
            ctx.restore();
        } else if(myCursor === cursors.circle) {
            ctx.beginPath();
            ctx.arc(myCursor.x, myCursor.y, myCursor.r, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.fillRect(myCursor.x, myCursor.y, myCursor.width, myCursor.height);
        }
    }
};

//add some objects
const fakeClick = new CustomEvent('click');
const addButtons = [addRectangle, addLine, addCircle];
for(let i=0; i<32; i++) {
    addButtons[i % 3].dispatchEvent(fakeClick);
}