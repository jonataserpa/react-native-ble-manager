# BLE Device Monitor

Aplicativo mobile em **React Native** para escanear, conectar e monitorar dispositivos **Bluetooth Low Energy (BLE)** usando `react-native-ble-manager`.

## Ideia do projeto

O objetivo é criar um app útil para desenvolvedores e técnicos que trabalham com dispositivos IoT, sensores BLE, ESP32, Arduino BLE, beacons e periféricos compatíveis.

O app permite:

- [x] Solicitar permissões Bluetooth por plataforma.
- [x] Verificar e inicializar o módulo BLE.
- [x] Escanear dispositivos BLE próximos.
- [x] Listar dispositivos encontrados (com botão de favoritar).
- [x] Conectar e desconectar dispositivos (com timeout client-side, loading e mensagem de erro inline).
- [x] Descobrir serviços e características (lista estruturada por serviço, com properties).
- [x] Ler características BLE (botão **Ler** em characteristics com property `Read`; mostra hex + ASCII imprimível).
- [x] Assinar notificações de características (toggle **Assinar/Parar notify** em characteristics com `Notify`/`Indicate`; valores chegam em tempo real).
- [x] Exibir logs de comunicação (todas as ações geram entrada na tela **Logs BLE**).
- [x] Salvar dispositivos favoritos localmente (estrela ★ no card e na tela de detalhes; persistido em `AsyncStorage`, sobrevive a reinícios).

### Fluxo típico de uso

1. **Home** → permite checar permissões e abrir as áreas de Buscar / Favoritos / Logs.
2. **Buscar dispositivos** → roda um scan de 8s; cada card mostra nome, MAC, RSSI, conectabilidade e ★. Tocar abre **Detalhes**.
3. **Favoritos** → lista os dispositivos marcados ★, com data em que foram salvos. Tocar abre **Detalhes** já com o cabeçalho preenchido (mesmo offline).
4. **Detalhes do dispositivo** → botão **Conectar** (com loading e timeout de 20s). Conectado, descobre serviços e mostra `CharacteristicCard` para cada característica:
   - Botão **Ler** → faz `BleManager.read` e exibe o último valor em hex + tradução ASCII (quando aplicável).
   - Botão **Assinar notify** → `BleManager.startNotification`; valores recebidos via `BleManagerDidUpdateValueForCharacteristic` aparecem com timestamp. Toque novamente para parar.
5. Ao desconectar (ou sair da tela), todas as `notifications` ativas são interrompidas automaticamente.

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
BleDeviceMonitor/
  android/
  ios/
src/
  app/
    AppNavigator.tsx
  components/
    CharacteristicCard.tsx     # 1 characteristic com botoes Ler / Notify
    DeviceCard.tsx             # card do scan + estrela favorito
    FavoriteToggle.tsx         # botao estrela reutilizavel
    PermissionStatus.tsx
    ScanButton.tsx
    ServicesList.tsx           # agrupa characteristics por servico
  modules/
    bluetooth/
      bluetooth.boot.ts        # sentinela DidUpdateState (boot)
      bluetooth.events.ts
      bluetooth.permissions.ts
      bluetooth.service.ts     # connect com timeout, read, start/stopNotification
      bluetooth.types.ts
      useCharacteristicValues.ts # hook read/notify por peripheral
  screens/
    DeviceDetailsScreen.tsx    # connect + lista de servicos/chars + favorito
    FavoritesScreen.tsx
    HomeScreen.tsx
    LogsScreen.tsx
    ScanScreen.tsx
  shared/
    formatBleLabel.ts
    formatBytes.ts             # bytes -> hex / ASCII imprimivel
  store/
    bluetooth.store.ts
    favorites.store.ts         # persiste favoritos no AsyncStorage
```

Os diretórios nativos Android/iOS ficam em `BleDeviceMonitor/`, enquanto o código TypeScript e o `package.json` ficam na raiz do repositório.

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

Compila e instala o app em um emulador ou dispositivo Android já aberto (usando `BleDeviceMonitor/android` como projeto nativo).

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

Listar dispositivos (USB ou Wi-Fi ADB):

```bash
npm run device:list
```

Conectar celular por Wi-Fi ADB (mesma rede do PC, sem cabo):

```bash
DEVICE_IP=192.168.0.20 npm run device:wifi:connect
```

Gerar APK release (para instalar manualmente):

```bash
npm run android:apk
```

Gerar APK release e instalar direto no device conectado:

```bash
npm run android:apk:install
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

Para testar Bluetooth real, prefira celular físico. Existem três caminhos: USB (recomendado para começar), Wi-Fi ADB (sem cabo) e instalar o APK release pronto.

> **Sobre QR code (Expo Go)**: o projeto usa **React Native CLI bare** com `react-native-ble-manager`, que é módulo nativo. O Expo Go não suporta dependências nativas fora da lista oficial, então não há leitor de QR code aqui. Para QR code real seria necessário migrar para **Expo Dev Client** (build própria com BLE), o que reescreve a config nativa atual.

### Cenário A — USB (mais simples)

1. No celular, ative **Opções do desenvolvedor** (toque 7× em "Número da versão" em Configurações > Sobre).
2. Ative **Depuração USB**.
3. Conecte o celular via USB ao PC.
4. Aceite o aviso "Permitir depuração USB?" (marque "Sempre permitir deste computador").
5. Confirme que o device aparece:

```bash
npm run device:list
```

Saída esperada (algo como):

```txt
List of devices attached
1A2B3C4D5E6F           device product:Pixel_8 model:Pixel_8 device:husky transport_id:2
```

> **Se aparecer `(MTP)` no `lsusb` mas o `adb devices` não listar**: a interface ADB não está exposta. Reveja o checklist do Cenário A.1 abaixo (especialmente Xiaomi/MIUI/HyperOS).

6. Execute (sobe Metro + faz reverse + instala no device):

```bash
npm run android:device
```

#### A.1 — Particularidades Xiaomi / Redmi / POCO (MIUI/HyperOS)

Em MIUI/HyperOS, o ADB depende de **3 toggles + 1 reboot** que costumam não vir habilitados:

- **Configurações > Configurações adicionais > Opções do desenvolvedor**:
  - ✅ **Depuração USB** — ativado.
  - ✅ **Instalar via USB** — ativado (pode pedir login Xiaomi e levar alguns segundos verificando rede).
  - 🔴 **Verificar apps via USB** — **desativado**.
  - 🔴 **Otimização MIUI** — **desativado** (no fim da lista; pede reboot do celular).
- Selecione o modo USB **"Transferência de arquivos"** ao plugar (não "Apenas carregamento").
- Após o reboot, replugue o cabo. Aceite o popup "Permitir depuração USB?" (marque "Permitir sempre deste computador").

Sem desativar a *MIUI Optimization*, o `adb install` retorna `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user` mesmo com tudo certo.

#### A.2 — Múltiplos devices (emulador + celular)

Se o `adb devices` lista mais de um device (emulador + celular), o RN CLI não sabe qual escolher. Pegue o serial em `npm run device:list` e use:

```bash
SERIAL=$(adb devices | awk '$2=="device" && $1!~"emulator"{print $1; exit}')
adb -s "$SERIAL" reverse tcp:8081 tcp:8081
npx react-native start --reset-cache &
npx react-native run-android --deviceId "$SERIAL" --no-packager
```

Para reinstalar rapidamente o APK debug já compilado (sem rebuild):

```bash
adb -s "$SERIAL" install -r BleDeviceMonitor/android/app/build/outputs/apk/debug/app-debug.apk
adb -s "$SERIAL" shell am start -n com.bledevicemonitor/.MainActivity
```

### Cenário B — Wi-Fi ADB (sem cabo, mesma rede do PC)

1. Faça primeiro o Cenário A uma vez (USB conectado).
2. Habilite Wi-Fi ADB no celular conectado:

```bash
adb tcpip 5555
```

3. Descubra o IP do celular (Configurações > Sobre o telefone > Status > Endereço IP).
4. Desconecte o cabo USB.
5. Conecte por Wi-Fi:

```bash
DEVICE_IP=192.168.0.20 npm run device:wifi:connect
```

> A porta padrão é `5555`. Se quiser outra: `DEVICE_IP=192.168.0.20:5557`.

6. Confirme com `npm run device:list` (deve aparecer `192.168.0.20:5555` em vez de um serial USB).
7. Rode normalmente:

```bash
npm run android:device
```

Para desconectar quando terminar:

```bash
npm run device:wifi:disconnect
```

> **Android 11+**: tem **Wireless Debugging** nativo (Configurações > Opções do desenvolvedor > Depuração sem fio). Aí você pareia uma vez (`adb pair IP:PORT`) e depois sempre `adb connect IP:PORT` sem precisar do cabo USB. Os scripts `device:wifi:connect`/`device:wifi:disconnect` funcionam para os dois casos.

### Cenário C — Instalar APK release (sem Metro, app autônomo)

Útil para deixar instalado e usar offline (sem PC ligado).

1. Conecte o device por USB ou Wi-Fi ADB (Cenário A ou B).
2. Gere e instale o APK release:

```bash
npm run android:apk:install
```

Esse comando roda `gradlew assembleRelease` em `BleDeviceMonitor/android` e depois `adb install -r app-release.apk`. O app vai ficar instalado e funciona sem o PC. O APK também fica disponível em `BleDeviceMonitor/android/app/build/outputs/apk/release/app-release.apk` para você transferir manualmente (Bluetooth, Drive, e-mail) e instalar em outros aparelhos.

> Para gerar só o APK sem instalar: `npm run android:apk`.

> Para release assinado em produção é necessário configurar `signingConfigs.release` em `BleDeviceMonitor/android/app/build.gradle` com sua keystore — o `app-release.apk` atual usa a debug keystore.

## Como usar o app

1. Abra o app.
2. Na tela inicial, conceda as permissões Bluetooth solicitadas (**Bluetooth próximo** no Android 12+, ou **Localização** no Android 6-11).
3. Confirme em **Configurações do sistema** que o Bluetooth está **ligado**. Se estiver desligado, o app vai pedir para ativar.
4. Toque em **Buscar dispositivos** → **Iniciar scan**.
5. Aguarde 8 segundos (duração padrão do scan).
6. Selecione um dispositivo.

> ### O que aparece (e o que NÃO aparece) no scan
>
> O scan procura **dispositivos BLE em modo *advertising*** (anunciando pacotes Bluetooth Low Energy próximos). **Não** é o mesmo que ver "todos os Bluetooth ligados na sala".
>
> ✅ **Aparece**: smartwatches, smart bands (Mi Band/Galaxy Watch), fones true-wireless quando em modo de pareamento, beacons (iBeacon/Eddystone), sensores de saúde (oxímetro, balança Mi/Xiaomi, termômetro), lâmpadas Yeelight/Philips Hue, ESP32/nRF em modo `BLEAdvertising`, fechaduras BLE.
>
> ❌ **NÃO aparece** (porque por padrão NÃO anunciam BLE): outro celular ou tablet com Bluetooth simplesmente "ligado", PCs, mouses/teclados Bluetooth Classic, fones já pareados a outro device.
>
> **Para testar**: ponha um Mi Band/smartwatch ao lado, ou abra o modo de pareamento de um fone Bluetooth (geralmente segurando o botão até a luz piscar). Beacons e sensores aparecem em segundos. Se quiser transformar um celular/tablet em advertiser para teste, instale um app como **"BLE Peripheral Simulator"** (Google Play) no tablet.


7. Toque em **Conectar**.
8. Após conectar, o app tenta recuperar serviços e características.
9. Acesse **Logs BLE** para ver eventos de scan, conexão, erros e diagnóstico.

## Quais dispositivos posso conectar

> **Resumo rápido**: o app fala **GATT sobre Bluetooth Low Energy (BLE)**. Isso significa que ele se conecta a **periféricos BLE que expõem um GATT server** — e **não** a dispositivos Bluetooth Classic (BR/EDR), nem a beacons puros, nem a aparelhos pareados pelo SO via perfis A2DP/HFP/HID.

### ✅ Tipos de dispositivos que conectam

| Categoria | Exemplos típicos | Observações |
|---|---|---|
| **Microcontroladores BLE** | ESP32, ESP32-C3/S3, nRF52, Raspberry Pi Pico W, Arduino Nano 33 BLE, módulos HM-10 / HC-08 | Maior caso de uso. Use libs como `ArduinoBLE` ou `NimBLE-Arduino` para expor um GATT server custom. |
| **Sensores médicos com perfis padrão** | Oxímetro de dedo, termômetro, balança, glicosímetro, monitor de pressão, smart band genérico | Muitos seguem perfis SIG (Heart Rate, Blood Pressure, Health Thermometer). |
| **Wearables & smartwatches abertos** | Mi Band 2/3 (modo unauthenticated), pulseiras de fitness com SDK público | Smartwatches modernos (Apple Watch, Galaxy Watch ativo, etc.) **não** conectam — usam pareamento criptografado. |
| **Lâmpadas, plugues e atuadores BLE** | Lâmpadas Yeelight/Mesh genéricas, plugues smart sem hub, fechaduras inteligentes | Algumas precisam de **bond/PIN** — use o switch _autoconnect_ ou empareie pelas Configurações Bluetooth do sistema antes. |
| **Beacons configuráveis** | iBeacon/Eddystone com modo de configuração (gimbal, kontakt.io, RadBeacon) | Em modo broadcast normal **só aparecem no scan**. Em modo configuração eles abrem GATT temporariamente. |
| **Equipamento industrial / medidor** | Multímetros BLE, balanças industriais, leitores RFID/NFC com BLE, dataloggers | Verifique se o fabricante documenta UUIDs GATT públicos. |
| **Outros celulares rodando este app** | Outro Android com este app exposto como peripheral (extensão futura) | Hoje o app só age como _central_; veja o roadmap. |

### ❌ Tipos de dispositivos que **NÃO** conectam

| Categoria | Por quê | O que fazer |
|---|---|---|
| **Fones de ouvido Bluetooth comuns** (JBL, Sony, Edifier) | Usam **Bluetooth Classic** (A2DP/HFP), não BLE GATT | Pareie pelas Configurações do Android — esse app não controla áudio. |
| **AirPods, Galaxy Buds, Pixel Buds** | Usam BLE + perfis proprietários protegidos por chaves do fabricante | Sem solução em apps de terceiros. |
| **Mouses e teclados Bluetooth Classic** | Perfil HID sobre BR/EDR | Pareie pelo SO. |
| **Beacons puros (iBeacon/Eddystone em modo normal)** | Só fazem broadcast (advertising), **não** abrem GATT server | Aparecem no scan, mas o **Conectar** vai dar timeout. Isto é esperado. |
| **Outro celular/tablet com "Bluetooth ligado"** | Não estão em modo _advertising_ BLE por padrão | Para testar, instale "**BLE Peripheral Simulator**" (Google Play) no outro device. |
| **Smart TVs, geladeiras, ar-condicionado IoT comuns** | Geralmente usam Wi-Fi + nuvem; BLE só para **provisionamento inicial** | Mesmo se aparecerem, o GATT só fica aberto durante o pareamento via app oficial. |
| **Apple Watch, HomeKit, Find My, AirTag** | Criptografia ponta-a-ponta exclusiva da Apple | Sem solução em apps de terceiros. |
| **Dispositivos pareados como áudio/teclado pelo Android** | Esses estão conectados via **perfis Classic** (A2DP/HFP/HID) — não aparecem em `getConnectedPeripherals` da lib | É uma limitação do Android, não do app. |

### ⚠️ Casos com ressalva (alguns conectam, outros não — depende do firmware)

- **Periféricos que pedem PIN/bond antes do GATT**: use o botão **Conectar** com o switch **Modo autoconnect** ligado, ou empareie primeiro nas Configurações Bluetooth do Android (o bond persiste).
- **Periféricos em "low-power advertising"**: anunciam por janelas curtas e demoram a aceitar conexão. **Modo autoconnect** é obrigatório.
- **Periféricos com criptografia de característica** (`Notify Encryption Required`, `Indicate Encryption Required`): este app exibe a property mas a leitura/notify só funciona após bond. Crie o bond primeiro pelas Configurações.
- **Periféricos com MTU > 23**: a característica responde com payload truncado até você pedir MTU maior. O app ainda **não** expõe um botão de `requestMTU` (no roadmap).

### Como descobrir se um periférico vai conectar

1. Abra **Buscar dispositivos** e veja se aparece com `Conectavel` no card. Se vier `Nao conectavel`, o próprio advertising já avisa que ele não aceita GATT — **pule**.
2. Mesmo se vier `Conectavel`, pode ser broadcast-only (alguns chips marcam errado a flag). Tente conectar; se der **timeout**, é provável que ele só anuncie.
3. Periféricos "demorados" (sensores com janela de advertising muito espaçada): tente **Conectar** com o switch **Modo autoconnect** ligado.
4. Em caso de dúvida, instale um app de referência como **nRF Connect** (Nordic Semiconductor, Google Play) no mesmo celular: se ele consegue ver serviços/características, este app também consegue.

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

## Estrutura nativa do projeto

Este repositório já contém os diretórios nativos React Native em `BleDeviceMonitor/android` e `BleDeviceMonitor/ios`.

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
