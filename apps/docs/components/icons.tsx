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
  api: Boxes,
  arrowRight: ArrowRight,
  calls: PhoneCall,
  check: Check,
  docs: BookOpen,
  examples: Terminal,
  github: GitBranch,
  npm: Package,
  recording: Radio,
  safety: ShieldAlert,
  terminal: Terminal,
  voice: Mic,
} as const satisfies Record<string, LucideIcon>;

export const Icon = ({
  icon: IconComponent,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) => (
  <IconComponent aria-hidden="true" focusable="false" className={className} />
);
