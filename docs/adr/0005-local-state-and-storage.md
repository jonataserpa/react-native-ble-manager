# ADR 0005 - Estado local e armazenamento

## Status

Aceito

## Contexto

O app precisa manter estado temporário de scan, conexão, logs e lista de dispositivos encontrados. Também precisa persistir dispositivos favoritos.

## Decisão

Usaremos Zustand para estado em memória e AsyncStorage para persistência local.

## Estado em memória

- Dispositivos encontrados.
- Dispositivo conectado.
- Status do scan.
- Logs BLE.
- Status de permissões.

## Estado persistente

- Dispositivos favoritos.
- Último dispositivo conectado futuramente.
- Preferências do usuário futuramente.

## Consequências

### Positivas

- Separação clara entre estado temporário e persistente.
- Fácil evolução.
- Baixo acoplamento com a camada de UI.

### Negativas

- AsyncStorage não deve ser usado para dados sensíveis.
- Pode ser necessário migrar para banco local se o volume de dados crescer.
