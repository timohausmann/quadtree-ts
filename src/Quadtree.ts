import type { NodeGeometry, Indexable } from './types';
import type { Rectangle } from './Rectangle';
import type { Circle } from './Circle';
import type { Line } from './Line';

/**
 * Quadtree Constructor Properties
 */
export interface QuadtreeProps {
    /**
     * Width of the node.
     */
    width: number;

    /**
     * Height of the node.
     */
    height: number;

    /**
     * X Offset of the node.
     * @defaultValue `0`
     */
    x?: number;

    /**
     * Y Offset of the node.
     * @defaultValue `0`
     */
    y?: number;

    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     */
    maxObjects?: number;

    /**
     * Minimum nesting levels of the root Quadtree node.
     * @defaultValue `0`
     */
    minLevels?: number;

    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     */
    maxLevels?: number;
}

/**
 * Class representing a Quadtree node.
 *
 * @example
 * ```typescript
 * const tree = new Quadtree({
 *   width: 100,
 *   height: 100,
 *   x: 0,           // optional, default:  0
 *   y: 0,           // optional, default:  0
 *   maxObjects: 10, // optional, default: 10
 *   minLevels: 0,   // optional, default:  0
 *   maxLevels: 4,   // optional, default:  4
 * });
 * ```
 *
 * @example Typescript: If you like to be explicit, you optionally can pass in a generic type for objects to be stored in the Quadtree:
 * ```typescript
 * class GameEntity extends Rectangle {
 *   ...
 * }
 * const tree = new Quadtree<GameEntity>({
 *   width: 100,
 *   height: 100,
 * });
 * ```
 */
export class Quadtree<ObjectsType extends Rectangle | Circle | Line | Indexable> {
    /**
     * The numeric boundaries of this node.
     * @readonly
     */
    bounds: NodeGeometry;

    /**
     * Max objects this node can hold before it splits.
     * @defaultValue `10`
     * @readonly
     */
    maxObjects: number;

    /**
     * Minimum nesting levels of the root Quadtree node.
     * @defaultValue `0`
     * @readonly
     */
    minLevels: number;

    /**
     * Total max nesting levels of the root Quadtree node.
     * @defaultValue `4`
     * @readonly
     */
    maxLevels: number;

    /**
     * The level of this node.
     * @defaultValue `0`
     * @readonly
     */
    level: number;

    /**
     * Array of objects in this node.
     * @defaultValue `[]`
     * @readonly
     */
    objects: ObjectsType[];

    /**
     * Subnodes of this node
     * @defaultValue `[]`
     * @readonly
     */
    nodes: this[];

    /**
     * Quadtree Constructor
     * @param props - bounds and properties of the node
     * @param level - depth level (internal use only, required for subnodes)
     */
    constructor(props: QuadtreeProps, level = 0) {
        this.bounds = {
            x: props.x || 0,
            y: props.y || 0,
            width: props.width,
            height: props.height,
        };
        this.maxObjects = typeof props.maxObjects === 'number' ? props.maxObjects : 10;
        this.minLevels = typeof props.minLevels === 'number' ? props.minLevels : 0;
        this.maxLevels = typeof props.maxLevels === 'number' ? props.maxLevels : 4;
        this.level = level;

        if (this.minLevels > this.maxLevels) {
            throw new Error(
                `minLevels (${this.minLevels}) must be less than maxLevels (${this.maxLevels})`
            );
        }

        this.objects = [];
        this.nodes = [];

        if (this.level < this.minLevels) {
            this.split();
        }
    }

    /**
     * Get the quadrant (subnode indexes) an object belongs to.
     *
     * @example Mostly for internal use but you can call it like so:
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * const rectangle = new Rectangle({ x: 25, y: 25, width: 10, height: 10 });
     * const indexes = tree.getIndex(rectangle);
     * console.log(indexes); // [1]
     * ```
     *
     * @param obj - object to be checked
     * @returns Array containing indexes of intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right).
     */
    getIndex(obj: Rectangle | Circle | Line | Indexable): number[] {
        return obj.qtIndex(this.bounds);
    }

    /**
     * Split the node into 4 subnodes.
     * @internal Mostly for internal use! You should only call this yourself if you know what you are doing.
     *
     * @example Manual split:
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.split();
     * console.log(tree); // now tree has four subnodes
     * ```
     */
    split(): void {
        const level = this.level + 1,
            width = this.bounds.width / 2,
            height = this.bounds.height / 2,
            x = this.bounds.x,
            y = this.bounds.y;

        const coords = [
            { x: x + width, y: y },
            { x: x, y: y },
            { x: x, y: y + height },
            { x: x + width, y: y + height },
        ];

        const Constructor = this.constructor as new (props: QuadtreeProps, level: number) => this;

        for (let i = 0; i < 4; i++) {
            this.nodes[i] = new Constructor(
                {
                    x: coords[i].x,
                    y: coords[i].y,
                    width,
                    height,
                    maxObjects: this.maxObjects,
                    minLevels: this.minLevels,
                    maxLevels: this.maxLevels,
                },
                level
            );
        }
    }

    /**
     * Insert an object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     *
     * @example you can use any shape here (or object with a qtIndex method, see README):
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.insert(new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'data' }));
     * tree.insert(new Circle({ x: 25, y: 25, r: 10, data: 512 }));
     * tree.insert(new Line({ x1: 25, y1: 25, x2: 60, y2: 40, data: { custom: 'property'} }));
     * ```
     *
     * @param obj - Object to be added.
     */
    insert(obj: ObjectsType): void {
        // if we have subnodes, call insert on matching subnodes
        if (this.nodes.length) {
            const indexes = this.getIndex(obj);

            for (let i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(obj);
            }
            return;
        }

        // otherwise, store object here
        this.objects.push(obj);

        // maxObjects exceeded and can still split deeper
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            // create subnodes
            this.split();

            // add all objects to their corresponding subnode
            for (let i = 0; i < this.objects.length; i++) {
                const indexes = this.getIndex(this.objects[i]);
                for (let k = 0; k < indexes.length; k++) {
                    this.nodes[indexes[k]].insert(this.objects[i]);
                }
            }

            // clean up this node
            this.objects = [];
        }
    }

    /**
     * Return all objects that could collide with the given geometry.
     *
     * @example Just like insert, you can use any shape here (or object with a qtIndex method, see README):
     * ```typescript
     * tree.retrieve(new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'data' }));
     * tree.retrieve(new Circle({ x: 25, y: 25, r: 10, data: 512 }));
     * tree.retrieve(new Line({ x1: 25, y1: 25, x2: 60, y2: 40, data: { custom: 'property'} }));
     * ```
     *
     * @param obj - geometry to be checked
     * @returns Array containing all detected objects.
     */
    retrieve(obj: Rectangle | Circle | Line | Indexable): ObjectsType[] {
        const indexes = this.getIndex(obj);
        let returnObjects = this.objects;

        // if we have subnodes, retrieve their objects
        if (this.nodes.length) {
            for (let i = 0; i < indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(obj));
            }
        }

        // remove duplicates
        if (this.level === 0) {
            return Array.from(new Set(returnObjects));
        }

        return returnObjects;
    }

    /**
     * Remove an object from the tree.
     * If you have to remove many objects, consider clearing the entire tree and rebuilding it or use the `fast` flag to cleanup after the last removal.
     * @beta
     *
     * @example
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * const circle = new Circle({ x: 25, y: 25, r: 10, data: 512 });
     * tree.insert(circle);
     * tree.remove(circle);
     * ```
     *
     * @example Bulk fast removals and final cleanup:
     * ```javascript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * const rects = [];
     *  for(let i=0; i<20; i++) {
     *    rects[i] = new Rectangle({ x: 25, y: 25, width: 50, height: 50 });
     *    tree.insert(rects[i]);
     *  }
     *  for(let i=rects.length-1; i>0; i--) {
     *    //fast=true – just remove the object (may leaves vacant subnodes)
     *    //fast=false – cleanup empty subnodes (default)
     *    const fast = (i !== 0);
     *    tree.remove(rects[i], fast);
     *  }
     * ```
     *
     * @param obj - Object to be removed.
     * @param fast - Set to true to increase performance temporarily by preventing cleanup of empty subnodes (optional, default: false).
     * @returns Weather or not the object was removed from THIS node (no recursive check).
     */
    remove(obj: ObjectsType, fast = false): boolean {
        const indexOf = this.objects.indexOf(obj);

        // remove objects
        if (indexOf > -1) {
            this.objects.splice(indexOf, 1);
        }

        // remove from all subnodes
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].remove(obj);
        }

        // remove all empty subnodes (respects minLevels constraint)
        if (this.level === 0 && !fast) {
            this.join();
        }

        return indexOf !== -1;
    }

    /**
     * Update an object already in the tree (shorthand for remove and insert).
     * If you have to update many objects, consider clearing and rebuilding the
     * entire tree or use the `fast` flag to cleanup after the last update.
     * @beta
     *
     * @example
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100, maxObjects: 1 });
     * const rect1 = new Rectangle({ x: 25, y: 25, width: 10, height: 10 });
     * const rect2 = new Rectangle({ x: 25, y: 25, width: 10, height: 10 });
     * tree.insert(rect1);
     * tree.insert(rect2);
     * rect1.x = 75;
     * rect1.y = 75;
     * tree.update(rect1);
     * ```
     * @example Bulk fast update and final cleanup:
     * ```javascript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * const rects = [];
     *  for(let i=0; i<20; i++) {
     *    rects[i] = new Rectangle({ x: 20, y: 20, width: 20, height: 20 });
     *    tree.insert(rects[i]);
     *  }
     *  for(let i=rects.length-1; i>0; i--) {
     *    rects[i].x = 20 + Math.random()*60;
     *    rects[i].y = 20 + Math.random()*60;
     *    //fast=true – just re-insert the object (may leaves vacant subnodes)
     *    //fast=false – cleanup empty subnodes (default)
     *    const fast = (i !== 0);
     *    tree.update(rects[i], fast);
     *  }
     * ```
     *
     * @param obj - Object to be updated.
     * @param fast - Set to true to increase performance temporarily by preventing cleanup of empty subnodes (optional, default: false).
     */
    update(obj: ObjectsType, fast = false): void {
        this.remove(obj, fast);
        this.insert(obj);
    }

    /**
     * The opposite of a split: merge and dissolve subnodes (when total object count doesn't exceed maxObjects).
     *
     * @example Manual join:
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.split();
     * console.log(tree.nodes.length); // 4
     * tree.join();
     * console.log(tree.nodes.length); // 0
     * ```
     *
     * @returns The objects from this node and all subnodes combined.
     */
    join(): ObjectsType[] {
        // recursive join
        let allObjects = Array.from(this.objects);
        for (let i = 0; i < this.nodes.length; i++) {
            const tmp = this.nodes[i].join();
            allObjects = allObjects.concat(tmp);
        }

        // remove duplicates
        const uniqueObjects = Array.from(new Set(allObjects));

        // join if maxObjects and minLevels allow it
        if (uniqueObjects.length <= this.maxObjects && this.level >= this.minLevels) {
            this.objects = uniqueObjects;
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].objects = [];
            }
            this.nodes = [];
        }

        return allObjects;
    }

    /**
     * Clear the Quadtree.
     *
     * @example
     * ```typescript
     * const tree = new Quadtree({ width: 100, height: 100 });
     * tree.insert(new Circle({ x: 25, y: 25, r: 10 }));
     * tree.clear();
     * console.log(tree); // tree.objects and tree.nodes are empty
     * ```
     */
    clear(): void {
        this.objects = [];

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }

        if (this.level >= this.minLevels) {
            this.nodes = [];
        }
    }
}
