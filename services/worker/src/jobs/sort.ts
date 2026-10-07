/**
 * Job 3: generate `size` random integers and sort them.
 * Uses both CPU (sorting) and memory (a 100,000-element array per job).
 */
export function sortJob(size: number): string {
  const numbers = Array.from({ length: size }, () => Math.floor(Math.random() * 1_000_000));

  numbers.sort((a, b) => a - b); // numeric sort (the default sort compares as strings)

  const min = numbers[0] ?? 0;
  const max = numbers[numbers.length - 1] ?? 0;
  return `Sorted ${size} numbers (min: ${min}, max: ${max})`;
}
