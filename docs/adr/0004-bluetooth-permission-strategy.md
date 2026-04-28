# ADR 0004 - Estratégia de permissões Bluetooth

## Status

Aceito

## Contexto

O Android possui regras diferentes para permissões BLE dependendo da versão do sistema. No Android 12 ou superior, permissões como `BLUETOOTH_SCAN` e `BLUETOOTH_CONNECT` são necessárias. Em versões anteriores, permissões de localização podem ser necessárias para scan BLE.

## Decisão

Criaremos um módulo isolado chamado `bluetooth.permissions.ts` para centralizar a lógica de permissões.

## Estratégia

### Android menor ou igual a 30

Solicitar:

- `ACCESS_FINE_LOCATION`

### Android 31+

Solicitar:

- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`

### iOS

Configurar no `Info.plist`:

- `NSBluetoothAlwaysUsageDescription`

## Consequências

### Positivas

- Permissões ficam isoladas.
- Menor duplicação de código.
- Mais fácil adaptar para novas versões do Android.

### Negativas

- Necessário testar em múltiplas versões de Android.
- Alguns fabricantes podem ter comportamentos diferentes.
