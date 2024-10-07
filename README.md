# Tulsii Notes

Tulsii is an offline-first note-taking app built to demonstrate the use of WatermelonDB as a local-first database (inspired by [Linear](https://linear.app/)'s offline-first approach and recent developments with InstandDB/ElectricSQL/WatermelonDB).

## Tech Stack

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [WatermelonDB](https://github.com/Nozbe/WatermelonDB)
- [Supabase](https://supabase.com/)

### Run locally

`npx expo run:ios --device`

### Build production

`eas build --profile production --platform ios`

### Submit to App Store

`eas submit -p ios --latest`

### Env

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```
