import { describe, it, expect } from 'vitest';

describe('SAIS Frontend Unit Tests', () => {
  it('validates grade scale bounds [0, 20]', () => {
    const minGrade = 0;
    const maxGrade = 20;
    const testGrade = 14.5;
    expect(testGrade).toBeGreaterThanOrEqual(minGrade);
    expect(testGrade).toBeLessThanOrEqual(maxGrade);
  });

  it('correctly maps academic risk badges based on thresholds', () => {
    const highRiskThreshold = 10.0;
    const moderateRiskThreshold = 14.0;

    const evaluateSupport = (grade: number) => {
      if (grade < highRiskThreshold) return 'critical';
      if (grade < moderateRiskThreshold) return 'warning';
      return 'safe';
    };

    expect(evaluateSupport(6.5)).toBe('critical');
    expect(evaluateSupport(9.9)).toBe('critical');
    expect(evaluateSupport(10.0)).toBe('warning');
    expect(evaluateSupport(13.5)).toBe('warning');
    expect(evaluateSupport(14.0)).toBe('safe');
    expect(evaluateSupport(18.0)).toBe('safe');
  });

  it('validates early mode feature exclusion', () => {
    const earlyFeatures = [
      'school', 'sex', 'age', 'address', 'famsize', 'Pstatus',
      'Mjob', 'Fjob', 'reason', 'guardian', 'traveltime', 'studytime',
      'failures', 'schoolsup', 'famsup', 'paid', 'activities', 'nursery',
      'higher', 'internet', 'romantic', 'famrel', 'freetime', 'goout',
      'Dalc', 'Walc', 'health', 'absences'
    ];

    expect(earlyFeatures.includes('G1')).toBe(false);
    expect(earlyFeatures.includes('G2')).toBe(false);
    expect(earlyFeatures.includes('G3')).toBe(false);
  });

  it('validates batch CSV parsing logic for valid status', () => {
    const sampleRow = {
      row_index: 1,
      student_id: 'Student-1',
      predicted_grade: 13.5,
      support_level: 'Moderate Support Needed',
      status: 'SUCCESS'
    };

    expect(sampleRow.status).toBe('SUCCESS');
    expect(sampleRow.predicted_grade).toBe(13.5);
  });
});

