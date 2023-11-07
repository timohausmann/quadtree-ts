import { Quadtree } from '../../src/Quadtree';
import { Rectangle } from '../../src/Rectangle';

describe('Quadtree.join', () => {

    test('is a function', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        expect(typeof tree.join).toBe('function');
    });

    test('returns an array of all objects', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        tree.insert(rect);
        const result = tree.join();
        expect(result).toEqual([rect]);
    });

    test('does what the example says', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        tree.split();
        expect(tree.nodes.length).toBe(4);
        tree.join();
        expect(tree.nodes.length).toBe(0);
    });
  
    test('calls join recursively', () => {
        const tree = new Quadtree({ width: 100, height: 100, maxLevels: 1, maxObjects: 4 });
        
        tree.split();
        
        const rects: Rectangle[] = [];
        for(let i=0; i<5; i++) {
            rects[i] = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
            tree.insert(rects[i]);
        }

        jest.spyOn(tree, 'join');
        jest.spyOn(tree.nodes[0], 'join');
        jest.spyOn(tree.nodes[1], 'join');
        jest.spyOn(tree.nodes[2], 'join');
        jest.spyOn(tree.nodes[3], 'join');

        tree.join();

        expect(tree.join).toHaveBeenCalledTimes(1);
        expect(tree.nodes[0].join).toHaveBeenCalledTimes(1);
        expect(tree.nodes[1].join).toHaveBeenCalledTimes(1);
        expect(tree.nodes[2].join).toHaveBeenCalledTimes(1);
        expect(tree.nodes[3].join).toHaveBeenCalledTimes(1);
    });  
});