import { ProjectTaskStatus, TopicStatus } from '../core/models';

export function statusIcon(status: TopicStatus | ProjectTaskStatus | string): string {
  switch (status) {
    case 'Completed': return 'check-circle';
    case 'Skipped': return 'skip';
    case 'InProgress': case 'Attempted': return 'half-circle';
    case 'Blocked': return 'alert';
    default: return 'circle';
  }
}
