import { Quadtree, QuadtreeProps } from '../../src/Quadtree';
import type { Rectangle } from '../../src/Rectangle';
import type { Circle } from '../../src/Circle';
import type { Line } from '../../src/Line';
import type { Indexable } from '../../src/types';
import { expectTypeOf } from 'expect-type';
type ObjectsTypeDefault = Rectangle|Circle|Line|Indexable

describe('Quadtree.constructor', () => {

    test('applies minimal arguments and defaults', () => {

        const tree = new Quadtree({ width: 100, height: 200 });
    
        expect(tree.bounds).toEqual({ x: 0, y: 0, width: 100, height: 200 });    
        expect(tree.maxObjects).toBe(10);
        expect(tree.maxLevels).toBe(4);
        expect(tree.level).toBe(0);
        expect(tree.objects).toEqual([]);
        expect(tree.nodes).toEqual([]);

        expectTypeOf(tree.nodes).toEqualTypeOf<Quadtree<ObjectsTypeDefault>[]>();
    });

    test('applies all arguments', () => {

        const tree = new Quadtree({ x: 20, y: 40, width: 100, height: 200, maxObjects: 5, maxLevels: 3 });
    
        expect(tree.bounds).toEqual({ x: 20, y: 40, width: 100, height: 200 });
        expect(tree.maxObjects).toBe(5);
        expect(tree.maxLevels).toBe(3);
    });

    test('handles subclass extension', () => {
        class SubQuadTree<ObjectsType extends ObjectsTypeDefault> extends Quadtree<ObjectsType> {
            public isSubClass: boolean

            constructor(props:QuadtreeProps, level=0) {
                super(props, level);
                this.isSubClass = true;
            }
        }

        const tree = new SubQuadTree({ x: 20, y: 40, width: 100, height: 200, maxObjects: 5, maxLevels: 3 });
        tree.split();
        expectTypeOf(tree.nodes).toEqualTypeOf<SubQuadTree<ObjectsTypeDefault>[]>();

        for(const node of tree.nodes){
            expect(node).toBeInstanceOf(SubQuadTree);
            expect(node.isSubClass).toBe(true);
            expectTypeOf(node).toEqualTypeOf<SubQuadTree<ObjectsTypeDefault>>();
        }
    });
});

