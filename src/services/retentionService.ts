import { RetentionCareConfig } from '../types/aura';

export interface RetentionCandidate {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  triggerType: 'MILESTONE_5' | 'MILESTONE_10' | 'INACTIVE_14D';
  completedClassesCount: number;
  daysSinceLastBooking: number;
  lastSessionTitle: string;
}

export const DEFAULT_RETENTION_CARE_CONFIG: RetentionCareConfig = {
  milestoneCheerEnabled: true,
  milestoneTargets: [5, 10],
  milestoneTemplate:
    '🎉 恭喜 {{studentName}} 完成第 {{count}} 堂練習！{{coachName}} 老師注意到您的核心穩定度與呼吸節奏明顯進步了，繼續保持這份美好的身心流動 ✨',
  gentleCheckInEnabled: true,
  inactiveDaysThreshold: 14,
  gentleCheckInTemplate:
    '最近忙碌嗎？{{coachName}} 老師為您留了專屬伸展時光 🌿 距離上次「{{lastClass}}」已過了兩週，隨時回來教室放鬆肩頸、重新充電！',
};

export const SAMPLE_RETENTION_CANDIDATES: RetentionCandidate[] = [];

export function formatRetentionMessage(
  template: string,
  params: {
    studentName: string;
    coachName: string;
    studioName: string;
    count?: number;
    lastClass?: string;
    days?: number;
  }
): string {
  return template
    .replace(/\{\{studentName\}\}/g, params.studentName)
    .replace(/\{\{coachName\}\}/g, params.coachName)
    .replace(/\{\{studioName\}\}/g, params.studioName)
    .replace(/\{\{count\}\}/g, String(params.count ?? 5))
    .replace(/\{\{lastClass\}\}/g, params.lastClass ?? 'Reformer Pilates')
    .replace(/\{\{days\}\}/g, String(params.days ?? 14));
}

export function evaluateActiveRetentionTriggers(
  config: RetentionCareConfig,
  coachName: string,
  studioName: string
): Array<{
  candidate: RetentionCandidate;
  formattedMessage: string;
  badgeLabelZh: string;
  badgeLabelEn: string;
}> {
  const results: Array<{
    candidate: RetentionCandidate;
    formattedMessage: string;
    badgeLabelZh: string;
    badgeLabelEn: string;
  }> = [];

  for (const candidate of SAMPLE_RETENTION_CANDIDATES) {
    if (
      (candidate.triggerType === 'MILESTONE_5' || candidate.triggerType === 'MILESTONE_10') &&
      config.milestoneCheerEnabled
    ) {
      results.push({
        candidate,
        formattedMessage: formatRetentionMessage(config.milestoneTemplate, {
          studentName: candidate.studentName,
          coachName,
          studioName,
          count: candidate.completedClassesCount,
          lastClass: candidate.lastSessionTitle,
        }),
        badgeLabelZh: `🏆 達成第 ${candidate.completedClassesCount} 堂里程碑喝采`,
        badgeLabelEn: `🏆 ${candidate.completedClassesCount}th Class Milestone Cheer`,
      });
    } else if (
      candidate.triggerType === 'INACTIVE_14D' &&
      config.gentleCheckInEnabled &&
      candidate.daysSinceLastBooking >= config.inactiveDaysThreshold
    ) {
      results.push({
        candidate,
        formattedMessage: formatRetentionMessage(config.gentleCheckInTemplate, {
          studentName: candidate.studentName,
          coachName,
          studioName,
          count: candidate.completedClassesCount,
          lastClass: candidate.lastSessionTitle,
          days: candidate.daysSinceLastBooking,
        }),
        badgeLabelZh: `💌 ${candidate.daysSinceLastBooking} 天未預約暖心關懷`,
        badgeLabelEn: `💌 ${candidate.daysSinceLastBooking}-Day Gentle Check-In`,
      });
    }
  }

  return results;
}

