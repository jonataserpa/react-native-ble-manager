# ADR 0002 - Usar react-native-ble-manager

## Status

Aceito

## Contexto

O app precisa escanear, conectar, ler características e receber notificações de dispositivos Bluetooth Low Energy.

## Decisão

Usaremos a biblioteca `react-native-ble-manager`.

## Justificativa

A biblioteca fornece APIs para:

- Inicializar o módulo BLE.
- Escanear dispositivos.
- Conectar e desconectar.
- Recuperar serviços.
- Ler características.
- Escrever características.
- Assinar notificações.

## Consequências

### Positivas

- Biblioteca focada em BLE.
- Suporte a Android e iOS.
- Compatível com autolinking em versões modernas do React Native.
- API suficiente para o escopo inicial do projeto.

### Negativas

- Exige configuração nativa.
- Permissões variam conforme versão do Android.
- Testes automatizados de BLE são limitados sem hardware real.
