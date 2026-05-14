function stripMask(value: string): string {
  return value.replace(/\D/g, '')
}

function allSameDigits(value: string): boolean {
  return /^(\d)\1+$/.test(value)
}

export function isValidCPF(raw: string): boolean {
  const cpf = stripMask(raw)
  if (cpf.length !== 11 || allSameDigits(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cpf[10])
}

export function isValidCNPJ(raw: string): boolean {
  const cnpj = stripMask(raw)
  if (cnpj.length !== 14 || allSameDigits(cnpj)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  function calcDigit(digits: string, weights: number[]): number {
    let sum = 0
    for (let i = 0; i < weights.length; i++) sum += parseInt(digits[i]) * weights[i]
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  if (calcDigit(cnpj, weights1) !== parseInt(cnpj[12])) return false
  if (calcDigit(cnpj, weights2) !== parseInt(cnpj[13])) return false
  return true
}
