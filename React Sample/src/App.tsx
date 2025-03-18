import React, { useState, useEffect, useRef } from 'react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  LineSeries,
  DateTime,
  Legend,
  Tooltip,
  SeriesModel,
  SplineSeries,
  ILoadedEventArgs,
  DataLabel,
  IAxisRangeCalculatedEventArgs,
  ChartTheme
} from '@syncfusion/ej2-react-charts';

// Define data type
type DataPoint = {
  x: number; // Could be Date
  y: number;
};
interface CustomSeriesModel extends SeriesModel {
  points: DataPoint[];
  addPoint: (point: DataPoint, duration: number) => void;
  removePoint: (index: number, duration: number) => void;
}

const App = () => {
  const chartRef = useRef<ChartComponent | null>(null);
  const maxPoints = 9;
  let data: any = []

  useEffect(() => {
    // Open a WebSocket connection
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('WebSocket connection opened');
    };
    // On receiving a data from the WebSocket server
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.initialData && chartRef.current) {
        // Update chart with initial data if present in the data.
        chartRef.current.series[0].dataSource = data.initialData;
      }
      if (data.updateData) {
        if (chartRef.current) {
          const seriesCollection = chartRef.current.series[0] as CustomSeriesModel;

          if (seriesCollection) {
            // Add new point from updateData to the series
            seriesCollection.addPoint({ x: data.updateData.x, y: data.updateData.y }, 860);
            if (seriesCollection.points.length > maxPoints) {
              // If number of points exceeds maxPoints, remove the oldest point
              seriesCollection.removePoint(0, 860);
            }
          }
        }
      }
    };
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.close();
    };
  }, []);
  const onChartLoad = (args: ILoadedEventArgs): void => {
    let chart: any = document.getElementById('charts');
    chart.setAttribute('title', '');
  };
  const load = (args: ILoadedEventArgs): void => {
    // eslint-disable-next-line no-restricted-globals
    let selectedTheme = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Fluent2';

    const theme = (
      selectedTheme.charAt(0).toUpperCase() +
      selectedTheme
        .slice(1)
        .replace(/-dark/i, 'Dark')
        .replace(/contrast/i, 'Contrast')
        .replace(/-highContrast/i, 'HighContrast')
    ) as ChartTheme;

    args.chart.theme = theme;
  };
  // Event triggered when the range of the axis is calculated
  const axisRangeCalculated = (args: IAxisRangeCalculatedEventArgs): void => {
    if (args.axis.name === 'primaryXAxis') {
      const lastPoint = args.axis.series[0].points[args.axis.series[0].points.length - 1].x;
      args.maximum = new Date(Number(lastPoint)).getTime() + 500;
    }
  };
  return (
    <div className="control-section" style={{ textAlign: "center" }} >
      <ChartComponent
        id="charts"
        ref={chartRef}
        chartArea={{ border: { width: 0 } }}
        primaryXAxis={{
          valueType: 'DateTime',
          labelFormat: 'hh:mm:ss',
          intervalType: 'Seconds',
          edgeLabelPlacement: 'Shift',
          majorGridLines: { width: 0 },
          lineStyle: { width: 0 }
        }}
        primaryYAxis={{
          labelFormat: '{value}', title: 'Value', 
          lineStyle: { width: 0 }
        }}
        title="Real-time Data"
        legendSettings={{ visible: true }}
        tooltip={{ enable: false, shared: true }}
        loaded={onChartLoad.bind(this)}
        load={load.bind(this)}
        axisRangeCalculated={axisRangeCalculated.bind(this)}
        width={'70%'}
      >
        <Inject services={[LineSeries, SplineSeries, DataLabel, DateTime, Legend, Tooltip]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={[data]}
            xName="x"
            yName="y"
            type="Spline"
            fill='brown'
            animation={{ enable: true }}
            marker={{ visible: true, isFilled: true, width: 7, height: 7 }}

          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};

export default App;