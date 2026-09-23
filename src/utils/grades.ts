export function gradeLabel(value: number): string {
  if (value >= 18) return 'Excellent'
  if (value >= 16) return 'Très bien'
  if (value >= 14) return 'Bien'
  if (value >= 12) return 'Assez bien'
  if (value >= 10) return 'Passable'
  if (value >= 8) return 'Insuffisant'
  return 'Faible'
}

export function gradeTone(value: number): 'success' | 'info' | 'warning' | 'danger' {
  if (value >= 14) return 'success'
  if (value >= 10) return 'info'
  if (value >= 8) return 'warning'
  return 'danger'
}

export function formatGrade(value: number, max = 20): string {
  const rounded = Math.round(value * 100) / 100
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0$/, '')
  return `${text}/${max}`
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function weightedAverage(
  items: { value: number; coef: number }[],
): number {
  const totalCoef = items.reduce((s, i) => s + i.coef, 0)
  if (totalCoef === 0) return 0
  return items.reduce((s, i) => s + i.value * i.coef, 0) / totalCoef
}
