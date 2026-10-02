export function reportPrimes(n: number, isPrime: (i: number) => boolean, log: (i: number) => void): void {
  for (let i = 2; i < n; i++) {
    if (isPrime(i)) {
      log(i);
    }
  }
}

export function reportIfPrime(n: number, isPrime: (i: number) => boolean, log: (i: number) => void): void {
  if (isPrime(n)) {
    log(n);
  }
}
