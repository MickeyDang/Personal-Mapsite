import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import { format } from "date-fns";
import { CombinedTimelineModel } from "../data/types";
import styles from "../styles/EventsTimelineChart.module.css";

interface BarChartProps {
  data: CombinedTimelineModel[];
  handleBarClick: (event: CombinedTimelineModel) => void;
  selectedBarIndex: number;
}

const CustomTooltip = ({ payload }) => {
  if (payload && payload.length) {
    const label = payload[0].payload.time;
    return (
      <div className={styles.tooltip}>
        <p>{format(new Date(label), "MMM yyyy")}</p>
      </div>
    );
  }
};

const EventsTimelineChart: React.FC<BarChartProps> = ({
  data,
  handleBarClick,
  selectedBarIndex,
}) => {
  const barColor = "#FF7262";
  const selectedBarColor = "#CC1400";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="barTime"
          scale="time"
          domain={["auto", "auto"]}
          tickFormatter={(date) => format(date, "MMM yyyy")}
          tick={{ fill: "#343434", fontFamily: "Roboto, sans-serif" }}
        />
        <YAxis tick={{ fill: "#343434", fontFamily: "Roboto, sans-serif" }} />
        <Tooltip content={({ payload }) => <CustomTooltip payload={payload} />} />
        <Bar
          dataKey="numEvents"
          stackId="a"
          fill={barColor}
          onClick={(event: CombinedTimelineModel) => {
            handleBarClick(event);
          }}
          shape={(props) => {
            const { x, y, width, height } = props;
            const isSelected = (selectedBarIndex === props.index);
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={isSelected ? selectedBarColor : barColor}
                stroke={isSelected ? selectedBarColor : barColor}
                strokeWidth={isSelected ? 3 : 1}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default EventsTimelineChart;
