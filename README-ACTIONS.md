# Build and release Tap Tile with GitHub Actions

The release workflow builds a **release-signed APK**. It does not use the Android debug key.

## One-time GitHub setup

In the repository, open:

`Settings -> Secrets and variables -> Actions -> New repository secret`

Create these four repository secrets:

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

For `KEYSTORE_BASE64`, encode your private release keystore on your own computer:

```bash
base64 -w 0 tap-tile-release.jks > tap-tile-release.base64
```

Then paste the contents of `tap-tile-release.base64` into the GitHub secret.

**Never commit `tap-tile-release.jks`, its Base64 file, or its passwords to Git.**

## Build

Run:

`Actions -> Build Android Release APK -> Run workflow`

The workflow:

1. Decodes the release keystore on the GitHub runner.
2. Builds `assembleRelease`.
3. Signs the APK with your release key.
4. Verifies the APK with `apksigner`.
5. Uploads the final APK as an artifact.
6. Publishes the APK when a `v*` tag is pushed.

The APK is suitable for the Cafe Bazaar upload as long as you keep using the same release key for future updates.
