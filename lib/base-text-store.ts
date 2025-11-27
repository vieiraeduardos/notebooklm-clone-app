// Gerenciamento de estado compartilhado para o texto base
// Em produção, use um banco de dados Redis ou similar

// Usar globalThis para garantir que a variável persista entre reinicializações
declare global {
  var baseTextStore: string | undefined;
}

if (typeof globalThis.baseTextStore === 'undefined') {
  globalThis.baseTextStore = "";
}

export function setBaseText(text: string) {
  globalThis.baseTextStore = text;
}

export function getBaseText(): string {
  return globalThis.baseTextStore || "";
}