# BLE Device Monitor

Aplicativo mobile em **React Native** para escanear, conectar e monitorar dispositivos **Bluetooth Low Energy (BLE)** usando `react-native-ble-manager`.

## Ideia do projeto

O objetivo é criar um app útil para desenvolvedores e técnicos que trabalham com dispositivos IoT, sensores BLE, ESP32, Arduino BLE, beacons e periféricos compatíveis.

O app permite:

- Solicitar permissões Bluetooth por plataforma.
- Verificar e inicializar o módulo BLE.
- Escanear dispositivos BLE próximos.
- Listar dispositivos encontrados.
- Conectar e desconectar dispositivos.
- Descobrir serviços e características.
- Ler características BLE.
- Assinar notificações de características.
- Exibir logs de comunicação.
- Salvar dispositivos favoritos localmente.

## Stack

- React Native CLI
- TypeScript
- react-native-ble-manager
- React Navigation
- Zustand
- AsyncStorage
- Jest
- ESLint + Prettier

## Estrutura

```txt
src/
  app/
    AppNavigator.tsx
  components/
    DeviceCard.tsx
    PermissionStatus.tsx
    ScanButton.tsx
  modules/
    bluetooth/
      bluetooth.events.ts
      bluetooth.permissions.ts
      bluetooth.service.ts
      bluetooth.types.ts
  screens/
    DeviceDetailsScreen.tsx
    HomeScreen.tsx
    LogsScreen.tsx
    ScanScreen.tsx
  shared/
    errors/
      AppError.ts
    utils/
      bytes.ts
  storage/
    favorites.storage.ts
  store/
    bluetooth.store.ts
```

## Instalação

```bash
npm install
```

## Executar no Android

```bash
npm run android
```

## Executar no iOS

```bash
cd ios
pod install
cd ..
npm run ios
```

## Criar projeto React Native nativo

Este repositório contém a estrutura base, documentação, ADRs e código inicial. Para gerar os diretórios nativos completos, execute:

```bash
npx @react-native-community/cli init BleDeviceMonitor --template react-native-template-typescript
```

Depois copie os arquivos deste repositório para dentro do projeto gerado.

## Permissões Android

Para Android 12 ou superior:

- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`

Para Android 6 até Android 11:

- `ACCESS_FINE_LOCATION`

Veja `docs/ANDROID_PERMISSIONS.md`.

## Permissões iOS

Configure no `Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Este app usa Bluetooth para encontrar e conectar dispositivos BLE próximos.</string>
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Permissões Android](docs/ANDROID_PERMISSIONS.md)
- [ADRs](docs/adr)

## Roadmap

### Fase 1 - MVP

- Setup do projeto.
- Permissões.
- Scan BLE.
- Lista de dispositivos.
- Logs básicos.

### Fase 2 - Conexão

- Conectar/desconectar.
- Recuperar serviços.
- Exibir características.

### Fase 3 - Comunicação

- Ler característica.
- Escrever característica.
- Notificações BLE.

### Fase 4 - Experiência

- Favoritos.
- Último dispositivo conectado.
- Logs persistentes.
- Melhor tratamento de erros.

### Fase 5 - Produção

- Testes.
- Build Android.
- Build iOS.
- CI/CD.
