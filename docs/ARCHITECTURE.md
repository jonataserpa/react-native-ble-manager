# Arquitetura

## Visão geral

O projeto é organizado por responsabilidade, separando interface, estado, persistência e integração nativa BLE.

## Camadas

### Screens

Telas navegáveis do aplicativo.

- `HomeScreen`: inicialização do app e entrada para os principais fluxos.
- `ScanScreen`: scan BLE e listagem de dispositivos encontrados.
- `DeviceDetailsScreen`: conexão, desconexão e descoberta de serviços.
- `LogsScreen`: visualização de eventos e erros BLE.

### Components

Componentes reutilizáveis sem regra de negócio pesada.

- `DeviceCard`
- `ScanButton`
- `PermissionStatus`

### Bluetooth Module

Centraliza a comunicação com `react-native-ble-manager`.

Arquivos:

- `bluetooth.service.ts`: operações BLE.
- `bluetooth.permissions.ts`: permissões por plataforma.
- `bluetooth.events.ts`: inscrição em eventos nativos.
- `bluetooth.types.ts`: tipos compartilhados.

### Store

Estado global em memória com Zustand.

Estados principais:

- `devices`
- `connectedDevice`
- `isScanning`
- `logs`
- `permissionsGranted`

### Storage

Persistência local usando AsyncStorage.

Dados persistidos inicialmente:

- Dispositivos favoritos.

## Fluxo principal

```txt
UI
 ↓
Zustand Store
 ↓
Bluetooth Service
 ↓
react-native-ble-manager
 ↓
Android/iOS BLE APIs
```

## Decisões importantes

- O módulo Bluetooth não deve depender de componentes React.
- As telas devem orquestrar ações, mas não acessar diretamente APIs nativas.
- Eventos BLE devem ser registrados em `bluetooth.events.ts`.
- Logs devem ser mantidos no store para ajudar diagnóstico em campo.

## Tratamento de erros

Erros devem ser convertidos em mensagens amigáveis para o usuário.

Exemplos:

- Bluetooth desligado.
- Permissão negada.
- Dispositivo fora de alcance.
- Falha ao conectar.
- Característica não suporta leitura ou notificação.

## Evolução sugerida

- Adicionar hook `useBluetoothScanner`.
- Criar camada de casos de uso.
- Persistir histórico de conexões.
- Adicionar testes unitários para permissões e store.
- Adicionar suporte a escrita em características BLE.
