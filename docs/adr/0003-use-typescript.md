# ADR 0003 - Usar TypeScript

## Status

Aceito

## Contexto

O projeto terá entidades como dispositivos, serviços, características, eventos e estados de conexão. Tipagem ajuda a reduzir erros durante o desenvolvimento e melhora a manutenção.

## Decisão

Usaremos TypeScript em todo o projeto.

## Consequências

### Positivas

- Melhor autocomplete.
- Melhor manutenção.
- Contratos claros para dispositivos e características BLE.
- Menos erros em tempo de execução.

### Negativas

- Necessidade de manter tipos atualizados.
- Curva inicial um pouco maior para quem usa apenas JavaScript.
