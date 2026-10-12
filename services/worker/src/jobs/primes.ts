
export function primesJob(limit: number): string {
  let count = 0;
  let largest = 0;

  for (let n = 2; n <= limit; n++) {
    if (isPrime(n)) {
      count++;
      largest = n;
    }
  }
  console.log(`Found ${count} primes up to ${limit} (largest: ${largest})`);
  return `Found ${count} primes up to ${limit} (largest: ${largest})`;
}

function isPrime(n: number): boolean {
  if (n < 4) return n > 1; // 2 and 3 are prime
  if (n % 2 === 0) return false;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}
