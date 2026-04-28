# Permissões Android para BLE

## Android 12 ou superior

Adicionar ao `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

Se o app não usa o scan para inferir localização física, é possível declarar:

```xml
<uses-permission
    android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />
```

## Android 11 ou inferior

Adicionar permissões antigas com limite de SDK:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
```

## Feature BLE

```xml
<uses-feature
    android:name="android.hardware.bluetooth_le"
    android:required="true" />
```

Use `required="false"` caso o app também funcione sem BLE.

## Runtime permissions

A função `requestBluetoothPermissions` implementa:

- Android 31+: `BLUETOOTH_SCAN` e `BLUETOOTH_CONNECT`.
- Android 23 até 30: `ACCESS_FINE_LOCATION`.
- iOS: retorna `true`, assumindo configuração no `Info.plist`.
