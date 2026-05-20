export interface Position {
  x: number;
  y: number;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  description?: string;
  badge?: string;
  position?: Position;
  content?: React.ReactNode;
  config?: Record<string, unknown>;
}

export interface DataProvider {
  (widgetId: string): Promise<unknown>;
}

export interface DashboardProps {
  widgets: WidgetConfig[];
  dataProvider?: DataProvider;
  theme?: 'light' | 'dark' | 'auto';
  loading?: boolean;
}
