import { describe, expect, it } from 'vitest';
import { assertProductionAuthenticationReady } from '../../config/productionGuard';

describe('production authentication guard', () => {
  it('allows local development', () => {
    expect(() => assertProductionAuthenticationReady('development')).not.toThrow();
  });

  it('refuses production startup until authenticated identity exists', () => {
    expect(() => assertProductionAuthenticationReady('production')).toThrow(
      'Production startup is disabled until authenticated user identity is implemented.',
    );
  });
});