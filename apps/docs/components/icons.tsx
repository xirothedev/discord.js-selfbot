import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  GitBranch,
  Mic,
  Package,
  PhoneCall,
  Radio,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON = {
  docs: BookOpen,
  api: Boxes,
  examples: Terminal,
  voice: Mic,
  calls: PhoneCall,
  recording: Radio,
  safety: ShieldAlert,
  terminal: Terminal,
  arrowRight: ArrowRight,
  check: Check,
  github: GitBranch,
  npm: Package,
} as const satisfies Record<string, LucideIcon>;

export function Icon({ icon: IconComponent, className }: { icon: LucideIcon; className?: string }) {
  return <IconComponent aria-hidden="true" focusable="false" className={className} />;
}
