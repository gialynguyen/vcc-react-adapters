import { deepEqual } from '../useDeepDerivedProps';

console.log(deepEqual({ a: 10 }, { a: 10 }));
console.log(deepEqual({ a: 10 }, { a: 12 }));
console.log(deepEqual({ a: 10 }, { b: 10 }));
console.log(deepEqual([], []));
console.log(deepEqual([1], []));
console.log(deepEqual([1], [2]));




