export function assertProductionAuthenticationReady(nodeEnv = process.env.NODE_ENV): void {
  if (nodeEnv === 'production') {
    throw new Error('Production startup is disabled until authenticated user identity is implemented.');
  }
}