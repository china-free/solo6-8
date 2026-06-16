import type { CandidateStatus } from '../../shared/types.js';

export const CANDIDATE_STATUS_ORDER: CandidateStatus[] = [
  'NEW',
  'SCREENING',
  'SCREENING_PASSED',
  'FIRST_INTERVIEW',
  'SECOND_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER_PENDING',
  'OFFER_SENT',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'HIRED',
  'REJECTED',
];

export const STATUS_LABEL: Record<CandidateStatus, string> = {
  NEW: '新简历',
  SCREENING: '待筛选',
  SCREENING_PASSED: '筛选通过',
  FIRST_INTERVIEW: '待初面',
  SECOND_INTERVIEW: '待复试',
  FINAL_INTERVIEW: '待终面',
  OFFER_PENDING: '待发Offer',
  OFFER_SENT: 'Offer已发送',
  OFFER_ACCEPTED: 'Offer已接受',
  OFFER_REJECTED: 'Offer已拒绝',
  HIRED: '已入职',
  REJECTED: '人才库',
};

function getStatusIndex(status: CandidateStatus): number {
  return CANDIDATE_STATUS_ORDER.indexOf(status);
}

export const VALID_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> = {
  NEW: [
    'SCREENING',
    'REJECTED',
  ],
  SCREENING: [
    'NEW',
    'SCREENING_PASSED',
    'REJECTED',
  ],
  SCREENING_PASSED: [
    'SCREENING',
    'FIRST_INTERVIEW',
    'SECOND_INTERVIEW',
    'FINAL_INTERVIEW',
    'REJECTED',
  ],
  FIRST_INTERVIEW: [
    'SCREENING_PASSED',
    'SECOND_INTERVIEW',
    'FINAL_INTERVIEW',
    'REJECTED',
  ],
  SECOND_INTERVIEW: [
    'FIRST_INTERVIEW',
    'FINAL_INTERVIEW',
    'OFFER_PENDING',
    'REJECTED',
  ],
  FINAL_INTERVIEW: [
    'SECOND_INTERVIEW',
    'OFFER_PENDING',
    'REJECTED',
  ],
  OFFER_PENDING: [
    'FINAL_INTERVIEW',
    'OFFER_SENT',
    'REJECTED',
  ],
  OFFER_SENT: [
    'OFFER_PENDING',
    'OFFER_ACCEPTED',
    'OFFER_REJECTED',
    'REJECTED',
  ],
  OFFER_ACCEPTED: [
    'OFFER_SENT',
    'HIRED',
    'REJECTED',
  ],
  OFFER_REJECTED: [
    'OFFER_SENT',
    'REJECTED',
  ],
  HIRED: [
    'OFFER_ACCEPTED',
  ],
  REJECTED: [
    'NEW',
    'SCREENING',
    'SCREENING_PASSED',
    'FIRST_INTERVIEW',
    'SECOND_INTERVIEW',
    'FINAL_INTERVIEW',
    'OFFER_PENDING',
  ],
};

export interface TransitionValidationResult {
  valid: boolean;
  reason?: string;
  allowedTargets?: CandidateStatus[];
}

export function validateStatusTransition(
  fromStatus: CandidateStatus,
  toStatus: CandidateStatus,
): TransitionValidationResult {
  if (fromStatus === toStatus) {
    return {
      valid: false,
      reason: `目标状态与当前状态相同（${STATUS_LABEL[fromStatus]}）`,
    };
  }

  const allowedTargets = VALID_TRANSITIONS[fromStatus];
  if (!allowedTargets) {
    return {
      valid: false,
      reason: `未知的当前状态: ${fromStatus}`,
    };
  }

  if (!allowedTargets.includes(toStatus)) {
    const fromLabel = STATUS_LABEL[fromStatus];
    const toLabel = STATUS_LABEL[toStatus];
    const allowedLabels = allowedTargets.map((s) => STATUS_LABEL[s]).join('、');

    return {
      valid: false,
      reason: `不支持从「${fromLabel}」直接变更为「${toLabel}」。` +
        `\n允许的目标状态：${allowedLabels}`,
      allowedTargets,
    };
  }

  return { valid: true };
}

export function isFinalStatus(status: CandidateStatus): boolean {
  return status === 'HIRED';
}

export function canSendOffer(status: CandidateStatus): boolean {
  return status === 'FINAL_INTERVIEW';
}

export function getNextSuggestedStatuses(
  current: CandidateStatus,
): CandidateStatus[] {
  return VALID_TRANSITIONS[current] || [];
}

export function getStatusProgress(status: CandidateStatus): number {
  const interviewStart = getStatusIndex('FIRST_INTERVIEW');
  const offerEnd = getStatusIndex('OFFER_ACCEPTED');
  const currentIdx = getStatusIndex(status);

  if (currentIdx <= getStatusIndex('SCREENING_PASSED')) {
    return Math.round((currentIdx / interviewStart) * 25);
  }

  if (currentIdx <= offerEnd) {
    const progress =
      25 + Math.round(((currentIdx - interviewStart) / (offerEnd - interviewStart)) * 65);
    return Math.min(progress, 90);
  }

  if (status === 'HIRED') return 100;
  if (status === 'REJECTED' || status === 'OFFER_REJECTED') return currentIdx >= offerEnd ? 85 : 50;

  return 95;
}
