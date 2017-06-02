var audio_context;
var n;
var gain;
var destination;
var canvas;
var analyser;
var WIDTH;
var HEIGHT;
start_web_audio();

var button = document.createElement("INPUT");
button.setAttribute("type", "button");
button.setAttribute("value", "toggle beat");
button.setAttribute("onclick", "toggle()");
var high = document.createElement("INPUT");
high.setAttribute("type", "range");
high.setAttribute("max", 2000);
high.setAttribute("min", 100);
var low = document.createElement("INPUT");
low.setAttribute("type", "range");
low.setAttribute("max", 2000);
low.setAttribute("min", 100);
var bpm = document.createElement("INPUT");
bpm.setAttribute("type", "range");
bpm.setAttribute("max", 2000);
bpm.setAttribute("min", 100);
bpm.setAttribute("onchange", "require_update = 1");
var duration = document.createElement("INPUT");
duration.setAttribute("type", "range");
duration.setAttribute("max", 1);
duration.setAttribute("min", 0.2);
duration.setAttribute("step", 0.1);
function br(){return document.createElement("br");}
document.body.prepend(button,br(),"high",br(),high,br(),"low",br(),low,br(),"duration",br(),duration,br(),"bpm",br(),bpm);

function loop(){
  if(!require_update) beat(parseInt(low.value),parseInt(high.value),audio_context.currentTime,parseFloat(duration.value)*curBpm/1000);
  else updateInterval();
}
var interval = null;
var curBpm = 0;
function updateInterval(){
  require_update = 0;
  window.clearInterval(interval);
  curBpm = 2100-parseInt(bpm.value);
  interval = setInterval(loop,curBpm);
  loop();
}
function toggle(){
  if(!interval){
    curBpm = 2100-parseInt(bpm.value);
    interval = setInterval(loop,curBpm);
    loop();
  }
  else {
    window.clearInterval(interval);
    interval = null;
  }
}

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
  destination = gain;//compressor;
  master_gain.connect(audio_context.destination);
  
  // Create Noisy node...
  n = new Noisy(audio_context, 16384); 
  //beat(440,3200,1); // This function creates noise in a range of the spectrum for a short time.
  //harmonic(440,1); // This function uses Noisy as an oscillator, making only one bin active.
  /*beat(440,440*3,1.5);
  beat(440,440*6,2);
  beat(493.88,493.88*3,2.5);
  beat(493.88,493.88*6,3);
  beat(554.37,554.37*3,3.5);
  beat(554.37,554.37*6,4);
  beat(587.33,587.33*3,4.5);
  node = n.createNoiseProcessor(); // NoiseProcessor is better if noise is playing for a long time, but it is more CPU consuming though...
  var g = audio_context.createGain();
  g.gain.value = 0;
  node.connect(g); // Noise processor won't start/stop, it gets connected and play. Control it with gain nodes.
  g.connect(destination);
  g.gain.setValueAtTime(1,5)
*/
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

function beat(l, h, t, d){
  if(d===undefined) d=1
  if(l>h) l = h;
  var b = n.createNoise(l,h); // Create the node.
  b.start();
  var g = audio_context.createGain(); // Gain node simulating ADSR
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(1,t+0.10*d);
  g.gain.linearRampToValueAtTime(0.2,t+0.30*d);
  g.gain.linearRampToValueAtTime(0,t+d);
  b.connect(g); // Connect it, just like a regular node.
  g.connect(destination);
  b.stop(t+d);
}

function harmonic(hz, t){
  var h1 = n.createNoise(hz);
  var h2 = n.createNoise(hz*2);
  var h3 = n.createNoise(hz*3);
  h1.start(t); 
  h1.connect(destination);
  h1.stop(t+1);
  h2.start(t); 
  h2.connect(destination);
  h2.stop(t+1);
  h3.start(t); 
  h3.connect(destination);
  h3.stop(t+1);
}

var offset_x=0;
function draw() {
  var freqDomain = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqDomain);
  var fac = 4;
  var width = WIDTH * 0.001;
  var height = HEIGHT/analyser.frequencyBinCount*fac;
  for (var i = 0; i < analyser.frequencyBinCount/fac; i++) {
    var value = freqDomain[i];
    var offset_y = HEIGHT - height*i - 1;
    var light = value/256 * 100;
    canvas.fillStyle = 'hsl(0, 0%, '+ light +'%)';
    canvas.fillRect(offset_x-0.3, offset_y, width, height);
  }
  offset_x=(offset_x+width)%WIDTH;
  canvas.clearRect(offset_x, 0, width, HEIGHT);
  drawVisual = requestAnimationFrame(draw);
}
