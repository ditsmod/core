import { describe, expect, it } from 'vitest';
import { GroupConfig, topologicalSort } from './topological-sort.js';

describe('topologicalSort()', () => {
  it('case 1', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
    ];
    const expectedSet = new Set(['MY_EXTENSIONS3', 'MY_EXTENSIONS2', 'MY_EXTENSIONS1']);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 2', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS1' },
    ];
    const expectedSet = new Set(['MY_EXTENSIONS3', 'MY_EXTENSIONS2', 'MY_EXTENSIONS1']);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 3', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
      { group: 'MY_EXTENSIONS1' },
    ];
    const expectedSet = new Set(['MY_EXTENSIONS3', 'MY_EXTENSIONS2', 'MY_EXTENSIONS1']);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 4', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS2' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
    ];
    const expectedSet = new Set(['MY_EXTENSIONS1', 'MY_EXTENSIONS3', 'MY_EXTENSIONS2']);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 5', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS10' },
    ];
    const expectedSet = new Set(['MY_EXTENSIONS2', 'MY_EXTENSIONS1', 'MY_EXTENSIONS3']);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 6', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
      { group: 'MY_EXTENSIONS4', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS5', beforeGroup: 'MY_EXTENSIONS4' },
    ];
    const expectedSet = new Set([
      'MY_EXTENSIONS3',
      'MY_EXTENSIONS2',
      'MY_EXTENSIONS5',
      'MY_EXTENSIONS4',
      'MY_EXTENSIONS1',
    ]);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 7', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS5', beforeGroup: 'MY_EXTENSIONS4' },
      { group: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
      { group: 'MY_EXTENSIONS4', beforeGroup: 'MY_EXTENSIONS1' },
    ];
    const expectedSet = new Set([
      'MY_EXTENSIONS5',
      'MY_EXTENSIONS3',
      'MY_EXTENSIONS2',
      'MY_EXTENSIONS4',
      'MY_EXTENSIONS1',
    ]);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });

  it('case 8', () => {
    const configs: GroupConfig<string>[] = [
      { group: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS5', beforeGroup: 'MY_EXTENSIONS4' },
      { group: 'MY_EXTENSIONS2', beforeGroup: 'MY_EXTENSIONS1' },
      { group: 'MY_EXTENSIONS3', beforeGroup: 'MY_EXTENSIONS2' },
      { group: 'MY_EXTENSIONS4', beforeGroup: 'MY_EXTENSIONS1' },
    ];
    const expectedSet = new Set([
      'MY_EXTENSIONS3',
      'MY_EXTENSIONS2',
      'MY_EXTENSIONS5',
      'MY_EXTENSIONS4',
      'MY_EXTENSIONS1',
    ]);
    expect(topologicalSort(configs, true)).toEqual(expectedSet);
  });
});
