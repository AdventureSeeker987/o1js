import { Field } from '../field.js';
import { ZkProgram } from '../proof_system.js';
import {
  Spec,
  boolean,
  equivalentAsync,
  field,
} from '../testing/equivalent.js';
import { Random } from '../testing/random.js';
import { rangeCheck64 } from './range-check.js';

let RangeCheck64 = ZkProgram({
  methods: {
    run: {
      privateInputs: [Field],
      method(x) {
        rangeCheck64(x);
      },
    },
  },
});

await RangeCheck64.compile();

let maybeUint64: Spec<bigint, Field> = {
  ...field,
  rng: Random.oneOf(Random.uint64, Random.uint64.invalid),
};

// do a couple of proofs
// TODO: we use this as a test because there's no way to check custom gates quickly :(

equivalentAsync({ from: [maybeUint64], to: boolean }, { runs: 3 })(
  (x) => {
    if (x >= 1n << 64n) throw Error('expected 64 bits');
    return true;
  },
  async (x) => {
    let proof = await RangeCheck64.run(x);
    return await RangeCheck64.verify(proof);
  }
);
