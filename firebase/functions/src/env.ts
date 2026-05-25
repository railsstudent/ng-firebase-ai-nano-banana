try {
  process.loadEnvFile();
} catch {
  // Ignore error if .env file is not found (e.g., in production where env vars are set by the platform)
}
