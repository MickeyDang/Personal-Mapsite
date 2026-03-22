import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { CombinedTimelineModel } from "../data/types";
import styles from "../styles/AITimelineChart.module.css";

interface AITimelineChartProps {
  data: CombinedTimelineModel[];
  handleBarClick: (event: CombinedTimelineModel) => void;
  selectedBarIndex: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <p>{format(new Date(data.time), "MMM yyyy")}</p>
        <p>
          {data.numEvents} moment{data.numEvents !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

const AITimelineChart: React.FC<AITimelineChartProps> = ({
  data,
  handleBarClick,
  selectedBarIndex,
}) => {
  const bubbleColor = "#FF7262";
  const selectedBubbleColor = "#CC1400";

  const maxEvents = useMemo(() => {
    return Math.max(...data.map((d) => d.numEvents), 1);
  }, [data]);

  // Normalize data so all bars have the same height (center bubbles vertically)
  const normalizedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      normalizedHeight: 1, // All same height to center the bubbles
    }));
  }, [data]);

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={normalizedData}
          margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        >
          <XAxis
            dataKey="barTime"
            scale="time"
            domain={["auto", "auto"]}
            tickFormatter={(date) => format(date, "MMM yy")}
            tick={{
              fill: "#343434",
              fontFamily: "Roboto, sans-serif",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, 1]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
          />
          <Bar
            dataKey="normalizedHeight"
            onClick={(event: CombinedTimelineModel) => {
              handleBarClick(event);
            }}
            shape={(props: any) => {
              const { x, y, width, height, index, payload } = props;
              if (x == null || y == null || width == null || height == null)
                return null;

              const isSelected = selectedBarIndex === index;
              const sizeRatio = payload.numEvents / maxEvents;
              const minR = 8;
              const maxR = 28;
              const r = minR + sizeRatio * (maxR - minR);

              const cx = x + width / 2;
              const cy = y + height / 2;

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={isSelected ? selectedBubbleColor : bubbleColor}
                  fillOpacity={isSelected ? 1 : 0.65}
                  stroke={isSelected ? selectedBubbleColor : "white"}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ cursor: "pointer" }}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AITimelineChart;
