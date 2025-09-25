import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: 'Fuel Risk',
      data: [0.2, 0.4, 0.6, 0.8, 0.9],
      borderColor: '#2ECC71',
      backgroundColor: '#2ECC71',
      tension: 0.4
    }
  ]
};

<Line data={data} />