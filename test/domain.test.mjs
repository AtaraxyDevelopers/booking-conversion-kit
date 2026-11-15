import test from "node:test";
import assert from "node:assert/strict";
import { config, example, analyze } from "../src/domain.mjs";
import { validateState } from "../src/lib.mjs";
test("Documented sample results match independently specified expectations", () => {
  const report = analyze(example.records, example.settings, config.asOf);
  for (const [label, value] of [
    ["Requests awaiting review", 1],
    ["Upcoming confirmations", 1],
    ["Qualified requests", 0],
  ])
    assert.equal(
      report.metrics.find((m) => m.label === label).value,
      value,
      label,
    );
});
test("Business edge cases", () => {
  (function edge(records, s, analyze, validate) {
    assert.throws(
      () =>
        validate(
          {
            ...example,
            records: [
              records[0],
              { ...records[0], id: "overlap", start: "2026-11-16T10:15" },
            ],
          },
          config,
        ),
      /overlap/,
    );
    assert.doesNotThrow(() =>
      validate(
        {
          ...example,
          records: [
            records[0],
            { ...records[0], id: "adjacent", start: "2026-11-16T10:30" },
          ],
        },
        config,
      ),
    );
  })(example.records, example.settings, analyze, validateState);
});
