# ADR 0001 - Usar React Native CLI

## Status

Aceito

## Contexto

O projeto precisa acessar recursos nativos de Bluetooth Low Energy. Bibliotecas BLE exigem configuração nativa detalhada em Android e iOS.

## Decisão

Usaremos React Native CLI em vez de Expo Managed Workflow.

## Consequências

### Positivas

- Maior controle sobre `AndroidManifest.xml`.
- Maior controle sobre `Info.plist`.
- Melhor compatibilidade com bibliotecas nativas BLE.
- Facilidade para configurar permissões específicas por plataforma.

### Negativas

- Setup inicial mais trabalhoso.
- Necessidade de Android Studio e Xcode.
- Builds nativos mais complexos.
