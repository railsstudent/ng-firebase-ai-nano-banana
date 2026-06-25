# Spec: Orchestrated Start Script

## Goal

Automatically start the Firebase Functions emulator first, wait until port `5001` is open, and then launch the Angular development server (`ng serve`). Ensure that both processes are terminated cleanly when exiting with `Ctrl+C`.

## Proposed Changes

### 1. Dependencies

Install `concurrently` and `wait-on` as development dependencies in the root project:

```bash
npm install -D concurrently wait-on
```

### 2. package.json script

Add a `"dev"` script to the root `package.json`'s `"scripts"` block:

```json
"dev": "concurrently -k \"npm run serve --prefix firebase/functions\" \"wait-on tcp:5001 && ng serve\""
```

## How it works

- `concurrently -k`: Runs both commands simultaneously. The `-k` flag ensures that if one process dies (e.g., you Ctrl+C), the other is also killed.
- `npm run serve --prefix firebase/functions`: Runs the Firebase function server/emulators.
- `wait-on tcp:5001 && ng serve`: Delays the execution of `ng serve` until port `5001` (the functions emulator port) is successfully listening.
