import { Quadtree } from '../../src/Quadtree';
import { Rectangle } from '../../src/Rectangle';

describe('Quadtree.remove', () => {

    test('is a function', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        expect(typeof tree.remove).toBe('function');
    });

    test('returns boolean', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        expect(tree.remove(rect)).toBeFalsy();
        tree.insert(rect);
        expect(tree.remove(rect)).toBeTruthy();
    });

    test('example #1: removes from objects array', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.insert(rect); 
        expect(tree.objects).toEqual([rect]);
        tree.remove(rect); 
        expect(tree.objects).toEqual([]);
    });

    test('example #2: fast cleanup', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rects: Rectangle[] = [];
        for(let i=0; i<20; i++) {
          rects[i] = new Rectangle({ x: 25, y: 25, width: 50, height: 50 });
          tree.insert(rects[i]);
        }
        for(let i=rects.length-1; i>1; i--) {
          tree.remove(rects[i], true);
        }
        expect(tree.nodes.length).toBeGreaterThan(0);
        expect(tree.nodes[0].nodes.length).toBeGreaterThan(0);
        expect(tree.nodes[1].nodes.length).toBeGreaterThan(0);
        expect(tree.nodes[2].nodes.length).toBeGreaterThan(0);
        expect(tree.nodes[3].nodes.length).toBeGreaterThan(0);

        tree.remove(rects[0]); 
        expect(tree.nodes.length).toBe(0);
    });

    test('removes objects from subnodes', () => {
        const tree = new Quadtree({ width: 100, height: 100, maxObjects: 2, maxLevels: 1 });
        const rects: Rectangle[] = [];
        for(let i=0; i<4; i++) {
            rects[i] = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
            tree.insert(rects[i]);
        }
        
        expect(tree.nodes[0].objects.length).toBe(4);
        expect(tree.nodes[1].objects.length).toBe(4);
        expect(tree.nodes[2].objects.length).toBe(4);
        expect(tree.nodes[3].objects.length).toBe(4);
        tree.remove(rects[3]);
        expect(tree.nodes[0].objects.length).toBe(3);
        expect(tree.nodes[1].objects.length).toBe(3);
        expect(tree.nodes[2].objects.length).toBe(3);
        expect(tree.nodes[3].objects.length).toBe(3);
    });

    test('join on remove resets subnodes', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.split();
        tree.insert(rect); 
        expect(tree.nodes[0].objects).toEqual([rect]);
        expect(tree.nodes[1].objects).toEqual([rect]);
        expect(tree.nodes[2].objects).toEqual([rect]);
        expect(tree.nodes[3].objects).toEqual([rect]);
        tree.remove(rect); 
        expect(tree.nodes).toEqual([]);
    });

    test('calls remove recursively', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect1 = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        const rect2 = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.split();
        tree.insert(rect1);
        tree.insert(rect2);

        jest.spyOn(tree.nodes[0], 'remove');
        jest.spyOn(tree.nodes[1], 'remove');
        jest.spyOn(tree.nodes[2], 'remove');
        jest.spyOn(tree.nodes[3], 'remove');

        tree.remove(rect1, true); 
        expect(tree.nodes[0].remove).toHaveBeenCalledTimes(1);
        expect(tree.nodes[1].remove).toHaveBeenCalledTimes(1);
        expect(tree.nodes[2].remove).toHaveBeenCalledTimes(1);
        expect(tree.nodes[3].remove).toHaveBeenCalledTimes(1);
    });

    
    test('calls join recursively when all nodes are empty', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        
        jest.spyOn(tree, 'join');

        tree.split();
        tree.insert(rect);
        tree.remove(rect);

        expect(tree.join).toHaveBeenCalledTimes(1);
    });
    
});