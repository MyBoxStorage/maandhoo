import crypto from 'crypto'

/**
 * Gera hash SHA-256 do CPF para busca sem expor o dado
 */
export function hashCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/[^0-9]/g, '')
  return crypto.createHash('sha256').update(cpfLimpo).digest('hex')
}

/**
 * Mascara CPF: "123.456.789-00" → "123.***.***-**"
 */
export function mascaraCPF(cpf: string): string {
  const nums = cpf.replace(/[^0-9]/g, '')
  if (nums.length !== 11) return '***.***.***-**'
  return `${nums.slice(0, 3)}.***.***-**`
}

/**
 * Formata CPF com pontuação: "12345678900" → "123.456.789-00"
 */
export function formatarCPF(cpf: string): string {
  const nums = cpf.replace(/[^0-9]/g, '')
  if (nums.length !== 11) return cpf
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`
}

/**
 * Valida CPF (algoritmo oficial)
 */
export function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/[^0-9]/g, '')
  if (nums.length !== 11) return false
  if (/^(\d)\1{10}$/.test(nums)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(nums[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(nums[10])
}

/**
 * Label legível do tipo de ingresso
 */
export function labelTipoIngresso(tipo: string): string {
  const labels: Record<string, string> = {
    pista_masc: 'Pista — Masculino',
    pista_fem: 'Pista — Feminino',
    lista_masc: 'Lista — Masculino',
    lista_fem: 'Lista — Feminino',
    camarote: 'Camarote',
    cortesia: 'Cortesia',
  }
  return labels[tipo] ?? tipo
}

/**
 * Calcula a data de expiração do ingresso: dia seguinte ao evento às 06h
 */
export function calcularExpiracao(dataEvento: string): Date {
  const data = new Date(dataEvento)
  data.setDate(data.getDate() + 1)
  data.setHours(6, 0, 0, 0)
  return data
}
