import { ChatIconComponent, CubeIconComponent, DomeIconComponent, GlassBottleIconComponent, HistoryIconComponent, MagicWandIconComponent, MapIconComponent, ScissorsIconComponent, SparklesIconComponent } from '@/navigation/icons/icons.component';

export const FEATURE_ICON_MAP: Record<string, any> = {
    create: MagicWandIconComponent,
    edit: SparklesIconComponent,
    restoration: HistoryIconComponent,
    fuse: ScissorsIconComponent,
    'visual-story': HistoryIconComponent,
    conversation: ChatIconComponent,
};

export const MODEL_ICON_MAP: Record<string, any> = {
    figurine: CubeIconComponent,
    '3d-map': MapIconComponent,
    bottle:  GlassBottleIconComponent,
    dome: DomeIconComponent,
};

export const TEMPLATE_ICON_MAP: Record<string, any> = {
    bottle:  GlassBottleIconComponent,
};
