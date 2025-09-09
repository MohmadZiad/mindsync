declare module "react-calendar-heatmap" {
    import * as React from "react";
  
    export interface HeatmapValue {
      date: string | Date;
      count: number;
    }
  
    export interface CalendarHeatmapProps {
      startDate: Date;
      endDate: Date;
      values: HeatmapValue[];
      classForValue?: (value: HeatmapValue | null) => string;
      gutterSize?: number;
      showWeekdayLabels?: boolean;
      horizontal?: boolean;
      onClick?: (value: HeatmapValue) => void;
      onMouseOver?: (value: HeatmapValue) => void;
      onMouseLeave?: (value: HeatmapValue) => void;
      transformDayElement?: (
        element: React.ReactElement,
        value: HeatmapValue,
        index: number
      ) => React.ReactElement;
    }
  
    export default class CalendarHeatmap extends React.Component<CalendarHeatmapProps> {}
  }
  