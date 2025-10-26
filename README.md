# quadtree-ts

[![CI](https://github.com/timohausmann/quadtree-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/timohausmann/quadtree-ts/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@timohausmann/quadtree-ts.svg)](https://www.npmjs.com/package/@timohausmann/quadtree-ts)
[![npm downloads](https://img.shields.io/npm/dw/@timohausmann/quadtree-ts.svg)](https://www.npmjs.com/package/@timohausmann/quadtree-ts)
[![Node.js Version](https://img.shields.io/node/v/@timohausmann/quadtree-ts.svg)](https://nodejs.org)

* [Docs and examples](#docs-and-examples)
* [Install](#install)
* [Use](#use)
  * [Shapes](#shapes)
  * [Custom data](#custom-data)
  * [Custom integration](#custom-integration)
* [Typescript](#typescript)
* [browser-support](#browser-support)
* [Development scripts](#development-scripts)
* [Migration from quadtree-js](#migration-from-quadtree-js)

This library can store and retrieve *Rectangles, Circles and Lines* in a recursive 2D quadtree. Every node can hold a maximum number of objects before it splits into four subnodes. Objects are only stored on leaf nodes (the lowest level). If an object overlaps into multiple leaf nodes, a reference to the object is stored in each node. 

This is a fork of [@timohausmann/quadtree-js](https://github.com/timohausmann/quadtree-js) using Typescript and supporting primitives and overall better extensibility.

## Docs and examples

* [Homepage](https://timohausmann.github.io/quadtree-ts/)
* [Examples](https://timohausmann.github.io/quadtree-ts/examples/simple/)
* [Docs](https://timohausmann.github.io/quadtree-ts/documentation/)

## Install

Install this module via [npm](https://www.npmjs.com/package/@timohausmann/quadtree-ts) and import or require it:

```bash
npm install @timohausmann/quadtree-ts
```

```javascript
// ES6
import { Quadtree } from '@timohausmann/quadtree-ts';
// CommonJS
const { Quadtree } = require('@timohausmann/quadtree-ts');
```

Alternatively, [download the source](https://github.com/timohausmann/quadtree-ts/archive/master.zip) and include it the old-fashioned way, or use an awesome CDN like [jsdelivr](https://www.jsdelivr.com/package/npm/@timohausmann/quadtree-ts) or [unpkg](https://unpkg.com/browse/@timohausmann/quadtree-ts@latest/). (If you only need Rectangles and want to save some bytes, use `quadtree.umd.basic.js` instead):

```html
<!-- self-hosted -->
<script src="quadtree.umd.full.js"></script>
<!-- CDN jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/@timohausmann/quadtree-ts/dist/quadtree.umd.full.js"></script>
<!-- CDN unpkg -->
<script src="https://unpkg.com/@timohausmann/quadtree-ts/dist/quadtree.umd.full.js"></script>
```


## Use

Create a new Quadtree:

```javascript
import { Quadtree } from '@timohausmann/quadtree-ts';

const myTree = new Quadtree({
    width: 800,
    height: 600,
    x: 0,           // optional, default:  0
    y: 0,           // optional, default:  0
    maxObjects: 10, // optional, default: 10
    maxLevels: 4    // optional, default:  4
});
``` 

The tree and each node may have four subnodes that are arranged like this:

|  II   |   I   |
|-------|-------|
|  III  |   IV  |

Optional properties: 
* `maxObjects` – defines how many objects a node can hold before it splits 
* `maxLevels` – defines the deepest level subnode
* `x` and `y` – coordinate offset

I recommend using low values for `maxLevels` because each level will quadruple the possible amount of nodes. Using lower values for `maxLevels` increases performance but may return more candidates. Finetuning these values depends on your 2D space, the amount and size of the objects and your retrieving areas. 

Insert elements in the Quadtree:
```javascript
import { Rectangle, Circle, Line } from '@timohausmann/quadtree-ts';

const rectangle = new Rectangle({
    x: 100,
    y: 100,
    width: 100,
    height: 100
});
myTree.insert(rectangle);

const line = new Line({
    x1: 25,
    y1: 25,
    x2: 75,
    y2: 25
})
myTree.insert(line);

const circle = new Circle({
    x: 100,
    y: 100,
    r: 50
})
myTree.insert(circle);
```

Retrieve elements from nodes that intersect with the given shape:
```javascript
const area = new Rectangle({
    x: 150,
    y: 150,
    width: 100,
    height: 100
})
const elements = myTree.retrieve(area);
```

Reset the Quadtree:
```javascript
myTree.clear();
```

### Shapes

The supported built-in primitive shapes are `Rectangle`, `Circle` and `Line`. 
All shapes can be inserted or used for retrieval. 
Each shape requires properties specific to their geometry.

| Shape     | Required Properties |
|-----------|---------------------|
| Rectangle | x, y, width, height |
| Circle    | x, y, r             |
| Line      | x1, y1, x2, y2      |

You can use these classes directly, extend them or integrate them in your own objects (see below). 

Note: if you are using the **UMD bundles**, the classes are available as `Quadtree.Rectangle`, `Quadtree.Circle` and `Quadtree.Line`.

```javascript
// Class usage as-is
const player = new Rectangle({ 
    x: 67, 
    y: 67, 
    width: 100, 
    height: 100 
});
myTree.insert(player);

// Class extension
class Explosion extends Circle {

    constructor(props) {
        super(props);
    }

    explode() {
        console.log('boom!');
    }
}
const explosion = new Explosion({ x: 100, y: 100, r: 100 });
const affectedObjects = myTree.retrieve(explosion);
```

### Custom data

All shapes support an optional data property that you can use however you like.

```javascript
const rectangle = new Rectangle({ 
    x: 24, 
    y: 24, 
    width: 100, 
    height: 100, 
    data: 'custom data here' 
});
const circle = new Circle({ 
    x: 128, 
    y: 128, 
    r: 50, 
    data: { 
        name: 'Stanley', 
        health: 100 
    } 
});
```

### Custom integration

Under the hood all shape classes implement a `qtIndex` method that is crucial for determining in which quadrant a shape belongs. You can think of it as a shape identifier. An alternative to using the class constructors is to supply your own `qtIndex` function for objects you want the Quadtree to interact with. 

This is also helpful if your existing object properties don't match the required shape properties and you have to map them.

```javascript
// Custom integration without mapping properties
// In this case the custom object has all the 
// expected shape properties (x1, y1, x2, y2)
// So we can simply reference the qtIndex method
const redLaser = {
    color: 'red',
    brightness: 10,
    x1: 67, 
    y1: 67, 
    x2: 128, 
    y2: 128,
    qtIndex: Line.prototype.qtIndex
}
myTree.insert(redLaser);

// Custom integration with mapping properties
// In this case the coordinates are arrays so they need to be mapped
const greenLaser = {
    color: 'green',
    brightness: 10,
    startPoint: [50, 50],
    endPoint: [100, 50],
    qtIndex: function(node) {
        return Line.prototype.qtIndex.call({
            x1: this.startPoint[0],
            y1: this.startPoint[1],
            x2: this.endPoint[0],
            y2: this.endPoint[1],
        }, node);
    }
};
myTree.insert(greenLaser);

// Custom integration with mapping in a class
// If you have many instances of the same thing, 
// I recommend adding the qtIndex to your class/prototype
class Bomb {

    constructor() {
        this.position = [50, 50];
        this.radius = 100;
    }

    qtIndex(node) {
        return Circle.prototype.qtIndex.call({
            x: this.position[0],
            y: this.position[1],
            r: this.radius,
        }, node);
    }
}
const bombOmb = new Bomb();
myTree.insert(bombOmb);

```

Check out the examples for more information.


## Typescript

All types can be imported and are documented in the [API docs](https://timohausmann.github.io/quadtree-ts/documentation/). 

The Quadtree class accepts an optional type argument `<ObjectsType>` for all inserted/retrieved objects:

```typescript
class GameEntity extends Rectangle {
    ...
}
const myTree = new Quadtree<GameEntity>({
    width: 800,
    height: 600
});
const rocket = new Rocket(...); // extends GameEntity
myTree.insert(rocket);
const results = myTree.retrieve(...); // GameEntity[]
```

The shape classes accept an optional type argument `<CustomDataType>` for the custom data:

```typescript
interface PlayerData {
    name: string
    health: number
}
const hero = new Rectangle<PlayerData>({
    x: 100,
    y: 100,
    width: 24,
    height: 48,
    data: {
        name: 'Shiffman',
        health: 100,
    }
});
```

## Browser Support

As of 2.0.0 the UMD bundles use ES6 features (e.g. classes) that are not supported by IE11 and below. 
For legacy browser support, please polyfill the code on your own or use [quadtree-js](https://github.com/timohausmann/quadtree-js). 


## Development scripts

* `npm run dev` to watch and build the source
* `npm run build` execute rollup, docs, dts
* `npm run rollup` to build the source only
* `npm run test` to run the test suite
* `npm run lint` to run eslint
* `npm run docs` to create docs
* `npm run dts` to create definition files
* `npx jest -i './test/Quadtree/Quadtree.remove.test.ts' -t 'removes objects from subnodes'` run a single test

Folder structure

* `/dist` auto-generated by `npm run build`
* `/docs` github pages
* `/docs/documentation` auto-generated by `npm run docs`
* `/docs/examples` the demo examples
* `/src` source code
* `/test` jest test suite
* `/types` Auto-generated by `npm run dts`



## Migration from quadtree-js

* Named exports only
  * Change import to `import { Quadtree } from ...`
* Quadtree constructor
  * `maxObjects` and `maxLevels` are now named properties. 
  * Also, `x` and `y` are now optional. 
  * Change `new Quadtree({x: 0, y: 0, width: 100, height: 100}, 5, 2);` to `new Quadtree({width: 100, height: 100, maxObjects: 5, maxLevels: 2});`
* Objects interacting with the Quadtree need to be a shape class or implement a `qtIndex` method (see above)
* Bundle filename has changed: `quadtree.umd.full.js`
* Typescript: Use `Rectangle` instead of `Rect`