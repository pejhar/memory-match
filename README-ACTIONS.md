# GitHub Actions APK Build

The repository includes `.github/workflows/build-apk.yml`.

It runs automatically on:

- Pushes to `main`
- Pull requests targeting `main`
- Version tags such as `v2.0.0`
- Manual runs from the GitHub **Actions** tab

The workflow uses JDK 17, Android SDK, and Gradle 8.10.2. It builds:

`app/build/outputs/apk/debug/app-debug.apk`

Every run uploads the APK as a workflow artifact. When a tag such as `v2.0.0` is pushed, the APK is also attached to a GitHub Release.

## First run

1. Push the repository to GitHub, including `.github/workflows/build-apk.yml`.
2. Open **Settings → Actions → General** and make sure Actions are allowed for the repository.
3. Open the **Actions** tab and select **Build Android APK**.
4. For a normal push to `main`, the workflow starts automatically.
5. For a release, run:

```bash
git tag v2.0.0
git push origin v2.0.0
```

The workflow produces a debug-signed APK for testing and direct installation. It is not a Play Store production-signing configuration.
