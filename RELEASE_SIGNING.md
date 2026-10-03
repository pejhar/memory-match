# Tap Tile release signing

The app is configured to build `release` APKs only with a dedicated release keystore.
It no longer uses `signingConfigs.debug`.

## GitHub Actions secrets

Create these repository secrets:

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

Create the keystore once and keep the original `.jks` and passwords safe. The same signing key must be used for future updates of the app.

To create the Base64 value on Linux:

```bash
base64 -w 0 tap-tile-release.jks > tap-tile-release.base64
```

Copy the contents of `tap-tile-release.base64` into the `KEYSTORE_BASE64` GitHub secret.

The workflow decodes the keystore only inside the GitHub runner and does not commit it to the repository.

## Build

Run the `Build Android Release APK` workflow manually from GitHub Actions, or push to `main`, or create a `v*` tag.

The resulting file is:

```text
release/Tap-Tile-<short-sha>-release.apk
```

The workflow also runs `apksigner verify --verbose` before uploading the APK.

Do not use an APK produced by `assembleDebug` for the Cafe Bazaar release upload.
