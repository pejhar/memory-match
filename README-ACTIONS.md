# Build and install the APK with GitHub Actions

1. Push this project to GitHub.
2. Create and push a version tag, for example:
   `git tag v1.0.0 && git push origin v1.0.0`
3. Open the repository's **Actions** tab and wait for **Build and Release APK** to finish.
4. Open **Releases** and download the APK from the new release.
5. On Android, allow installation from the browser/file manager when prompted, then install the APK.

This workflow builds a debug-signed APK. It is suitable for direct installation/testing on Android. It is not a Play Store production signing setup.
