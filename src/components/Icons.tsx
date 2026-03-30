// Maps reel iconKey strings to Phosphor icons
import {
  Fire,
  Spiral,
  Target,
  ArrowsSplit,
  MaskHappy,
  Gauge,
  Eye,
  Shield,
  Lightning,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

const iconMap: Record<string, Icon> = {
  flame:     Fire,
  spiral:    Spiral,
  target:    Target,
  crack:     ArrowsSplit,
  mask:      MaskHappy,
  gauge:     Gauge,
  eye:       Eye,
  shield:    Shield,
  lightning: Lightning,
};

interface LayerIconProps {
  iconKey: string;
  size?: number;
  color?: string;
  className?: string;
}

export function LayerIcon({ iconKey, size = 16, color = 'currentColor', className }: LayerIconProps) {
  const Icon = iconMap[iconKey] ?? Fire;
  return <Icon size={size} color={color} className={className} weight="duotone" />;
}
