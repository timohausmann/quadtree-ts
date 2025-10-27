import { Quadtree } from '../../src/Quadtree';
import { Rectangle } from '../../src/Rectangle';

describe('Quadtree.update', () => {
    test('is a function', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        expect(typeof tree.update).toBe('function');
    });

    test('returns void', () => {
        const tree = new Quadtree({ width: 100, height: 100 });
        const rect = new Rectangle({ x: 0, y: 0, width: 100, height: 100 });
        const result = tree.update(rect);
        expect(result).toEqual(undefined);
    });

    test('does what the example says', () => {
        const tree = new Quadtree({ width: 100, height: 100, maxObjects: 2, maxLevels: 1 });
        const rect1 = new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'rect 1' });
        const rect2 = new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'rect 2' });
        const rect3 = new Rectangle({ x: 25, y: 25, width: 10, height: 10, data: 'rect 2' });
        tree.insert(rect1);
        tree.insert(rect2);
        tree.insert(rect3);

        expect(tree.nodes[1].objects).toEqual([rect1, rect2, rect3]);

        rect1.x = 75;
        rect1.y = 75;
        tree.update(rect1);

        expect(tree.nodes[1].objects).toEqual([rect2, rect3]);
        expect(tree.nodes[3].objects).toEqual([rect1]);
    });

    test('calls remove and insert', () => {
        const tree = new Quadtree({ width: 100, height: 100, maxLevels: 1, maxObjects: 4 });
        const rect1 = new Rectangle({ x: 25, y: 25, width: 10, height: 10 });
        tree.insert(rect1);

        jest.spyOn(tree, 'remove');
        jest.spyOn(tree, 'insert');

        tree.update(rect1);

        expect(tree.remove).toHaveBeenCalledTimes(1);
        expect(tree.insert).toHaveBeenCalledTimes(1);
    });
});
