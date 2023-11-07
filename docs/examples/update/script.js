// Our Quadtree
const tree = new Quadtree({
    width: 640,
    height: 480,
    maxObjects: 9,
});


// A Rectangle representing the mouse cursor.
// We only use this object to retrieve objects (it is not in the Quadtree)
const myCursor = new Quadtree.Rectangle({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
});

// Our objects will be stored here
const myObjects = [];

// Canvas and context
const canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

// Keep track of mouseover state
let isMouseover = false;

// EventListener for mousemove
canvas.addEventListener('mousemove', function(e) {
    
    isMouseover = true;
    
    // Position cursor at mouse position
    myCursor.x = e.offsetX - (myCursor.width/2);
    myCursor.y = e.offsetY - (myCursor.height/2);
});
canvas.addEventListener('mouseout', function(e) {	
    isMouseover = false;
});

function draw() {
    
    // Clear the canvas
    ctx.clearRect(0, 0, 640, 480);
    
    // Draw stuff
    drawObjects(myObjects, ctx);
    drawQuadtree(tree, ctx);

    if(isMouseover) {
        ctx.strokeStyle = 'rgba(127,255,212,1)';
        ctx.strokeRect(myCursor.x, myCursor.y, myCursor.width, myCursor.height);
    }
};

// Main loop
function loop() {
    
    // Reset myObjects check property
    myObjects.forEach(obj => {
        obj.data.check = false;
    });

    // Update the circle position
    myCircle.x = 320 + Math.cos(Date.now()/1000) * 176;
    myCircle.y = 240 + Math.sin(Date.now()/1000) * 176;

    tree.update(myCircle);
    
    // Retrieve all objects that share nodes with the cursor
    if(isMouseover) {
        const candidates = tree.retrieve(myCursor);

        // Flag retrieved objects
        candidates.forEach(obj => obj.data.check = true);
    }

    // Draw scene
    draw();
    
    window.requestAnimationFrame(loop);
};

// Create some "static" objects
const cols = 6;
const rows = 6;
for(let x=0;x<cols;x++) {
    for(let y=0;y<rows;y++) {
        const rectangle = new Quadtree.Rectangle({
            x: 72 + (x/cols) * (canvas.width-72),
            y: 56 + (y/rows) * (canvas.height-56),
            width: 16,
            height: 16,
            data: {
                check: false,
            },
        });

        myObjects.push(rectangle);
        tree.insert(rectangle);
    }
}

// Create a moving circle
const myCircle = new Quadtree.Circle({
    x: 32,
    y: 240,
    r: 32,
    data: {
        check: false,
    },
});

myObjects.push(myCircle);
tree.insert(myCircle);

loop();