import { Quadtree } from '../../src/Quadtree';
import { Rectangle } from '../../src/Rectangle';

describe('Quadtree.minLevels', () => {
    test('defaults to 0', () => {
        const tree = new Quadtree({ width: 100, height: 100 });

        expect(tree.minLevels).toBe(0);
        expect(tree.nodes).toEqual([]);
    });

    test('throws error when minLevels > maxLevels', () => {
        expect(() => {
            new Quadtree({ width: 100, height: 100, minLevels: 5, maxLevels: 4 });
        }).toThrow('minLevels (5) must be less than maxLevels (4)');
    });

    test('eagerly splits to minLevels depth on construction', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 2 });

        // Root should have 4 subnodes (level 1)
        expect(tree.nodes.length).toBe(4);
        expect(tree.level).toBe(0);

        // Each subnode should also have 4 subnodes (level 2)
        for (const node of tree.nodes) {
            expect(node.nodes.length).toBe(4);
            expect(node.level).toBe(1);

            // Level 2 nodes should not have subnodes yet (we're at minLevels)
            for (const subnode of node.nodes) {
                expect(subnode.nodes.length).toBe(0);
                expect(subnode.level).toBe(2);
            }
        }
    });

    test('creates exactly minLevels depth (minLevels = 1)', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 1 });

        // Root should have 4 subnodes
        expect(tree.nodes.length).toBe(4);

        // Level 1 nodes should not have subnodes
        for (const node of tree.nodes) {
            expect(node.nodes.length).toBe(0);
            expect(node.level).toBe(1);
        }
    });

    test('creates exactly minLevels depth (minLevels = 3)', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 3, maxLevels: 5 });

        // Verify 3 levels of depth
        expect(tree.nodes.length).toBe(4);

        for (const level1 of tree.nodes) {
            expect(level1.nodes.length).toBe(4);

            for (const level2 of level1.nodes) {
                expect(level2.nodes.length).toBe(4);

                for (const level3 of level2.nodes) {
                    expect(level3.nodes.length).toBe(0);
                    expect(level3.level).toBe(3);
                }
            }
        }
    });

    test('respects minLevels when inserting objects', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 2, maxObjects: 1 });

        // Insert a single object
        const rect = new Rectangle({ x: 10, y: 10, width: 5, height: 5 });
        tree.insert(rect);

        // Tree structure should still exist despite having only 1 object
        expect(tree.nodes.length).toBe(4);

        // Object should be in one of the leaf nodes (level 2)
        let foundObject = false;
        for (const level1 of tree.nodes) {
            for (const level2 of level1.nodes) {
                if (level2.objects.includes(rect)) {
                    foundObject = true;
                }
            }
        }
        expect(foundObject).toBe(true);
    });

    test('propagates minLevels to child nodes', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 2 });

        // Check that all nodes have the same minLevels value
        expect(tree.minLevels).toBe(2);
        for (const node of tree.nodes) {
            expect(node.minLevels).toBe(2);
            for (const subnode of node.nodes) {
                expect(subnode.minLevels).toBe(2);
            }
        }
    });

    test('clear() preserves minLevels structure', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 2 });

        // Insert some objects
        tree.insert(new Rectangle({ x: 10, y: 10, width: 5, height: 5 }));
        tree.insert(new Rectangle({ x: 60, y: 60, width: 5, height: 5 }));

        // Clear the tree
        tree.clear();

        // minLevels structure should still exist
        expect(tree.nodes.length).toBe(4);
        for (const node of tree.nodes) {
            expect(node.nodes.length).toBe(4);
            expect(node.objects.length).toBe(0);

            for (const subnode of node.nodes) {
                expect(subnode.nodes.length).toBe(0);
                expect(subnode.objects.length).toBe(0);
            }
        }
    });

    test('remove() preserves minLevels structure (minLevels = 1)', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 1, maxObjects: 5 });

        // Insert multiple objects
        const rect1 = new Rectangle({ x: 10, y: 10, width: 5, height: 5 });
        const rect2 = new Rectangle({ x: 60, y: 10, width: 5, height: 5 });
        const rect3 = new Rectangle({ x: 10, y: 60, width: 5, height: 5 });
        tree.insert(rect1);
        tree.insert(rect2);
        tree.insert(rect3);

        // All should be inserted
        expect(tree.retrieve(new Rectangle({ x: 0, y: 0, width: 100, height: 100 })).length).toBe(
            3
        );

        // Remove all objects
        tree.remove(rect1);
        tree.remove(rect2);
        tree.remove(rect3);

        // minLevels structure should still exist
        expect(tree.nodes.length).toBe(4);
        for (const node of tree.nodes) {
            expect(node.nodes.length).toBe(0);
            expect(node.level).toBe(1);
        }
    });

    test('remove() preserves minLevels structure (minLevels = 2)', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 2, maxObjects: 5 });

        // Insert multiple objects
        const rect1 = new Rectangle({ x: 10, y: 10, width: 5, height: 5 });
        const rect2 = new Rectangle({ x: 60, y: 10, width: 5, height: 5 });
        const rect3 = new Rectangle({ x: 10, y: 60, width: 5, height: 5 });
        const rect4 = new Rectangle({ x: 60, y: 60, width: 5, height: 5 });
        tree.insert(rect1);
        tree.insert(rect2);
        tree.insert(rect3);
        tree.insert(rect4);

        // Remove all objects
        tree.remove(rect1);
        tree.remove(rect2);
        tree.remove(rect3);
        tree.remove(rect4);

        // minLevels structure should still exist
        expect(tree.nodes.length).toBe(4);
        for (const level1 of tree.nodes) {
            expect(level1.nodes.length).toBe(4);
            expect(level1.level).toBe(1);
            for (const level2 of level1.nodes) {
                expect(level2.nodes.length).toBe(0);
                expect(level2.level).toBe(2);
            }
        }
    });

    test('remove() with fast=true does not trigger join', () => {
        const tree = new Quadtree({ width: 100, height: 100, minLevels: 1, maxObjects: 5 });

        // Insert and remove objects with fast=true
        const rect = new Rectangle({ x: 50, y: 50, width: 5, height: 5 });
        tree.insert(rect);
        tree.remove(rect, true);

        // minLevels structure should still exist
        expect(tree.nodes.length).toBe(4);
    });
});
