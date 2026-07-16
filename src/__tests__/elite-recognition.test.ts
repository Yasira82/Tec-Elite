import { describe, it, expect } from 'vitest';
import {
  RECOGNITIONS, PROGRAM_META, TIER_META, STATUS_META, getRecognition,
} from '@/lib/elite/recognition';

describe('TEC Elite — Excellence Runtime (C-127), read-only V1', () => {
  it('every recognition has a known program, tier, and status with criteria', () => {
    expect(RECOGNITIONS.length).toBeGreaterThan(0);
    for (const r of RECOGNITIONS) {
      expect(PROGRAM_META[r.program]).toBeTruthy();
      expect(TIER_META[r.tier]).toBeTruthy();
      expect(STATUS_META[r.status]).toBeTruthy();
      expect(r.criteria.length).toBeGreaterThan(0);
    }
  });

  it('CRITERIA-BASED (C-127): an ACTIVE recognition has ALL criteria passed', () => {
    for (const r of RECOGNITIONS.filter((x) => x.status === 'ACTIVE')) {
      expect(r.criteria.every((c) => c.passed), r.id).toBe(true);
    }
  });

  it('a CANDIDATE has at least one unmet criterion (not yet granted)', () => {
    const cand = RECOGNITIONS.find((r) => r.status === 'CANDIDATE');
    expect(cand).toBeTruthy();
    expect(cand?.criteria.some((c) => !c.passed)).toBe(true);
  });

  it('GOLD/PLATINUM tiers require human review (grantedBy PANEL)', () => {
    for (const r of RECOGNITIONS.filter((x) => x.tier === 'GOLD' || x.tier === 'PLATINUM')) {
      expect(r.grantedBy, r.id).toBe('PANEL');
    }
  });

  it('tiers map to percentile bands (earned, never bought)', () => {
    expect(TIER_META.BRONZE.band).toBe('Top 10%');
    expect(TIER_META.PLATINUM.band).toBe('Top 0.1%');
  });

  it('getRecognition resolves by id and fails closed for an unknown id', () => {
    expect(getRecognition('top-merchant-bronze')?.program).toBe('TOP_MERCHANT');
    expect(getRecognition('nope')).toBeNull();
  });
});
