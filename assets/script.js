var audio_context;
var gain;
var destination;
var canvas;
var analyser;
var WIDTH;
var HEIGHT;
start_web_audio();


function start_web_audio(){
  // Create some nodes...
  if(audio_context!=null) audio_context.close();
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  gain = audio_context.createGain();
  master_gain = audio_context.createGain();
  compressor = audio_context.createDynamicsCompressor();
  compressor.connect(gain);
  gain.gain.value = 1;
  gain.connect(master_gain);
  destination = compressor;
  master_gain.connect(audio_context.destination);
  
  // Create Noisy node...
  var n = new Noisy(audio_context); 
  var node = n.createNoise(100,1000);
  node.start(); 
  node.connect(destination);
  node.stop(2);

  // Draw spectrum...
  analyser = audio_context.createAnalyser();
  gain.connect(analyser);
  analyser.fftSize = 4096;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  var canvas_e = document.getElementsByClassName('visualizer')[0];
  canvas = canvas_e.getContext("2d");
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  WIDTH = canvas_e.width;
  HEIGHT = canvas_e.height;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);

  draw();
}

function draw() {
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var freqDomain = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqDomain);
  var fac = 4;
  for (var i = 0; i < analyser.frequencyBinCount/fac; i++) {
    var value = freqDomain[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/analyser.frequencyBinCount*fac;
    var hue = i/analyser.frequencyBinCount * 360;
    canvas.fillStyle = 'hsl(' + 1 + ', 100%, 50%)';
    canvas.fillRect(i * barWidth, offset, barWidth, height);
  }
  var timeDomain = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(timeDomain);
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var value = timeDomain[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/analyser.frequencyBinCount;
    canvas.fillStyle = 'black';
    canvas.fillRect(i * barWidth, offset, 1, 1);
  }
  drawVisual = requestAnimationFrame(draw);
}
