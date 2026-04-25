export function calculateFees(amt: number) {
  const orFee = Math.max(amt * 0.055, 0.8)
  const myFee = Math.max(amt * 0.04, 0.8)
  return {
    amt,
    orFee,
    myFee,
    totalFee: Math.round((orFee + myFee) * 100) / 100,
    total: Math.round((amt + orFee + myFee) * 100) / 100
  }
}
