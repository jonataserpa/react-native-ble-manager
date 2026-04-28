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

## Ambiente recomendado no Linux Garuda

Como o Garuda é baseado em Arch Linux, a recomendação prática é usar **Android Studio + Android Emulator + KVM**.

Para React Native com Android, é necessário ter Node, JDK e Android Studio configurados. A documentação atual do React Native recomenda Android Studio para preparar o ambiente Android e JDK 17 para evitar problemas de compatibilidade. Também é necessário configurar `ANDROID_HOME` e adicionar `emulator` e `platform-tools` ao `PATH`.

### Qual emulador usar?

Use um AVD baseado em imagem **x86_64** com Google APIs.

Sugestão:

```txt
Pixel 8
Android API 35
Imagem: Google APIs x86_64
Nome do AVD: Pixel_8_API_35
```

Motivos:

- É um perfil moderno e estável.
- Tem bom suporte no Android Studio.
- Usa imagem x86_64, melhor para aceleração via KVM no Linux.
- Simula bem permissões recentes de Bluetooth do Android 12+.

> Importante: emulador Android normalmente **não é adequado para testar BLE real**, porque o Bluetooth Low Energy depende de hardware físico. Use o emulador para validar telas, navegação, permissões e fluxo visual. Para scan/conexão BLE real, use um celular Android físico.

## Instalação no Garuda Linux

### 1. Instalar dependências principais

```bash
sudo pacman -Syu
sudo pacman -S nodejs npm jdk17-openjdk android-tools watchman
```

Instale o Android Studio pelo Pamac/Octopi, AUR ou Flatpak. Exemplo via Flatpak:

```bash
flatpak install flathub com.google.AndroidStudio
```

### 2. Configurar Java 17

```bash
sudo archlinux-java set java-17-openjdk
java -version
```

### 3. Configurar Android SDK

No Android Studio:

1. Abra **Settings**.
2. Vá em **Languages & Frameworks > Android SDK**.
3. Instale:
   - Android SDK Platform 35.
   - Android SDK Build-Tools 35.0.0.
   - Android SDK Platform-Tools.
   - Android Emulator.
   - Android SDK Command-line Tools.
4. Vá em **Device Manager**.
5. Crie um dispositivo **Pixel 8** com imagem **Google APIs x86_64 API 35**.
6. Nomeie o AVD como:

```txt
Pixel_8_API_35
```

### 4. Configurar variáveis de ambiente

Adicione no `~/.zshrc` ou `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Depois execute:

```bash
source ~/.zshrc
# ou
source ~/.bashrc
```

Valide:

```bash
echo $ANDROID_HOME
adb version
emulator -list-avds
```

### 5. Verificar KVM

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
ls -l /dev/kvm
```

Se `/dev/kvm` existir, adicione seu usuário ao grupo `kvm`:

```bash
sudo usermod -aG kvm $USER
```

Reinicie a sessão após esse comando.

O Android Emulator funciona melhor com aceleração de hardware/KVM no Linux. A documentação oficial do Android destaca que a aceleração de hardware melhora renderização e desempenho do emulador.

## Instalação do projeto

```bash
git clone git@github.com:jonataserpa/react-native-ble-manager.git
cd react-native-ble-manager
npm install
```

## Scripts disponíveis

```bash
npm run start
```

Inicia o Metro Bundler.

```bash
npm run start:reset
```

Inicia o Metro limpando cache.

```bash
npm run android
```

Compila e instala o app em um emulador ou dispositivo Android já aberto.

```bash
npm run android:emulator
```

Abre o emulador configurado e depois executa o app.

Por padrão, esse script procura o AVD:

```txt
Pixel_8_API_35
```

Para usar outro AVD:

```bash
AVD_NAME=Nome_Do_Seu_AVD npm run android:emulator
```

Liste os AVDs disponíveis:

```bash
npm run emulator:list
```

Verifique dispositivos conectados:

```bash
npm run adb:devices
```

Executar em celular físico:

```bash
npm run android:device
```

Limpar build Android:

```bash
npm run android:clean
```

Verificar ambiente React Native:

```bash
npm run doctor
```

Rodar testes:

```bash
npm test
```

Verificar TypeScript:

```bash
npm run typecheck
```

Rodar lint:

```bash
npm run lint
```

## Como executar no emulador

1. Abra um terminal e inicie o Metro:

```bash
npm run start
```

2. Em outro terminal, execute:

```bash
npm run android:emulator
```

3. Se o emulador já estiver aberto, pode usar:

```bash
npm run android
```

4. Se houver problema com conexão do Metro:

```bash
npm run android:reverse
npm run start:reset
npm run android
```

## Como executar em celular físico Android

Para testar Bluetooth real, prefira celular físico.

1. Ative **Opções do desenvolvedor** no Android.
2. Ative **Depuração USB**.
3. Conecte o celular via USB.
4. Confirme a autorização RSA no celular.
5. Verifique se o aparelho aparece:

```bash
adb devices
```

6. Execute:

```bash
npm run android:device
```

## Como usar o app

1. Abra o app.
2. Na tela inicial, conceda as permissões Bluetooth solicitadas.
3. Toque em **Buscar dispositivos**.
4. Toque em **Iniciar scan**.
5. Aguarde a listagem de dispositivos BLE próximos.
6. Selecione um dispositivo.
7. Toque em **Conectar**.
8. Após conectar, o app tenta recuperar serviços e características.
9. Acesse **Logs BLE** para ver eventos de scan, conexão, erros e diagnóstico.

## Como testar o app

### Teste em emulador

Use o emulador para validar:

- Build Android.
- Navegação entre telas.
- Renderização dos componentes.
- Fluxo de permissões.
- Tela de logs.
- Estado global com Zustand.

Limitação: BLE real geralmente não funciona no emulador.

### Teste em dispositivo físico

Use um celular Android real para validar:

- Solicitação real de permissões Bluetooth.
- Scan de dispositivos BLE.
- Conexão com periférico BLE.
- Descoberta de serviços.
- Leitura de características.
- Notificações BLE.

Dispositivos úteis para teste:

- ESP32 com BLE.
- Arduino Nano 33 BLE.
- Beacon BLE.
- Sensor BLE.
- Outro periférico BLE conhecido.

### Checklist manual

- [ ] App instala no Android.
- [ ] App abre sem crash.
- [ ] Permissões são solicitadas corretamente.
- [ ] Scan inicia e finaliza.
- [ ] Logs são registrados.
- [ ] Dispositivos aparecem na lista em celular físico.
- [ ] App conecta a um dispositivo BLE.
- [ ] Serviços e características aparecem após conexão.
- [ ] Desconexão funciona.

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
