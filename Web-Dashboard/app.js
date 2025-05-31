const broker = '<Input your IP or Url Broker>';

const client = mqtt.connect(broker, {
  clientId: 'mq2_dashboard_' + Math.random().toString(16).substr(2, 8),
  clean: true
});

const mq2El = document.getElementById('mq2');
const statusText = document.getElementById('statusText');
const dangerAudio = document.getElementById('dangerSound');
const ctx = document.getElementById('gaugeChart').getContext('2d');

let isDangerPlaying = false;

let gaugeChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [0, 100],
      backgroundColor: ['#00ff00', '#303e57'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '80%',
    }]
  },
  options: {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false }
    }
  }
});

function updateGauge(value) {
  let bg, status;

  if (value < 300) {
    bg = '#00ff00';
    status = 'SAFE';
  } else if (value < 600) {
    bg = '#ffa500';
    status = 'WARNING';
  } else {
    bg = '#ff0000';
    status = 'DANGER!';
  }

  const val = Math.min(value / 10, 100);
  gaugeChart.data.datasets[0].data[0] = val;
  gaugeChart.data.datasets[0].data[1] = 100 - val;
  gaugeChart.data.datasets[0].backgroundColor[0] = bg;
  gaugeChart.update();

  statusText.textContent = status;
  statusText.style.color = bg;

  if (status === 'BAHAYA!') {
    if (!isDangerPlaying) {
      dangerAudio.play().catch(err => console.error('Audio error:', err));
      isDangerPlaying = true;
    }
  } else {
    if (isDangerPlaying) {
      dangerAudio.pause();
      dangerAudio.currentTime = 0;
      isDangerPlaying = false;
    }
  }
}

client.on('connect', () => {
  console.log('MQTT Connected');
  client.subscribe('<Input Your MQTT Topic>');
});

client.on('message', (topic, message) => {
  const value = parseFloat(message.toString());

  if (topic === '<Input Your MQTT Topic>') {
    mq2El.textContent = value;
    updateGauge(value);
  }
});

client.on('error', err => {
  console.error('MQTT Error:', err);
});
