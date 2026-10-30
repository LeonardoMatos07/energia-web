import {
  BarChart,
  BoxplotChart,
  CustomChart,
  LineChart,
  PieChart,
  ScatterChart,
} from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  PolarComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";

// Only what the plotter draws: the full ECharts bundle is several times larger.
echarts.use([
  BarChart,
  BoxplotChart,
  CustomChart,
  LineChart,
  PieChart,
  ScatterChart,
  AriaComponent,
  GridComponent,
  LegendComponent,
  PolarComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
  SVGRenderer,
]);

export { echarts };
