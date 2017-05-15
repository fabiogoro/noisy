var f = new FFTJS(65536);
var res = f.createComplexArray();
var audio_context;
audio_context = new (window.AudioContext || window.webkitAudioContext)();

QUnit.test( "Returns a buffer correctly", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise(500,1000);
  assert.ok( node.constructor == AudioBufferSourceNode, "Passed!" );
});

QUnit.test( "Returns a buffer correctly without arguments", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise();
  assert.ok( node.constructor == AudioBufferSourceNode, "Passed!" );
});

QUnit.test( "Returns a buffer correctly without last argument", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise(100);
  assert.ok( node.constructor == AudioBufferSourceNode, "Passed!" );
});

QUnit.test( "Returns a buffer correctly with values greater than Nyquist frequency", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise(100,audio_context.sampleRate);
  assert.ok( node.constructor == AudioBufferSourceNode, "Passed!" );
});

QUnit.test( "Returns a buffer correctly with values less than 0", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise(-50,audio_context.sampleRate);
  assert.ok( node.constructor == AudioBufferSourceNode, "Passed!" );
});

QUnit.test( "Throws when Noisy has no AudioContext in call", function( assert ) {
  assert.throws(function(){new Noisy();}, "Passed!");
  assert.throws(function(){new Noisy('string');}, "Passed!");
});

QUnit.test( "Phase keeps value 0", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise();
  var buffer = node.buffer.getChannelData(0);
  buffer = f.toComplexArray(buffer)
  f.transform(res, buffer);
  assert.ok(res[freqbin(153)+1]<0.0001, "Passed!");
});

QUnit.test( "Bins out the range are 0", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise(0);
  var buffer = node.buffer.getChannelData(0);
  buffer = f.toComplexArray(buffer)
  f.transform(res, buffer);
  assert.ok(Math.abs(res[2])<0.0001, "Passed!");
  var node = n.createNoise(5,10);
  var buffer = node.buffer.getChannelData(0);
  buffer = f.toComplexArray(buffer)
  f.transform(res, buffer);
  assert.ok(Math.abs(res[freqbin(5)-2])<0.0001, "Passed!");
  assert.ok(Math.abs(res[freqbin(10)+2])<0.0001, "Passed!");
  var node = n.createNoise(900,1000);
  var buffer = node.buffer.getChannelData(0);
  buffer = f.toComplexArray(buffer)
  f.transform(res, buffer);
  assert.ok(Math.abs(res[freqbin(900)-2])<0.0001, "Passed!");
  assert.ok(Math.abs(res[freqbin(1000)+2])<0.0001, "Passed!");
});

QUnit.test( "Default energy is constant", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise();
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.1,2)*65536)<0.1, "Passed!");
  var node = n.createNoise(10);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.1,2)*65536)<0.1, "Passed!");
  var node = n.createNoise(10,100);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.1,2)*65536)<0.1, "Passed!");
});

QUnit.test( "Energy factor defines mean energy", function( assert ) {
  var n = new Noisy(audio_context); 
  var node = n.createNoise(0,22050,1);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(1,2)*65536)<10, "Passed!");
  var node = n.createNoise(0,22050,0.01);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.01,2)*65536)<0.1, "Passed!");
  var node = n.createNoise(0,22050,0.001);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.001,2)*65536)<0.1, "Passed!");
  var node = n.createNoise(10,100,0.001);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.001,2)*65536)<0.01, "Passed!");
  var node = n.createNoise(10,10,0.001);
  var buffer = node.buffer.getChannelData(0);
  eb = buffer.reduce(energy)
  assert.ok(Math.abs(eb-0.5*Math.pow(0.001,2)*65536)<0.01, "Passed!");
});

function freqbin(hz){
  var n = new Noisy(audio_context); 
  return 2*n.freqbin(hz);
}

function div(a){
  return a/m[0];
}

function max(p, c, i){
  if(i==0 && p>c) return [p,0];
  else if(p[0]>c) return p;
  return [c,i];
}
function energy(p, c, i){
  if(i==1) return Math.pow(p,2) + Math.pow(c,2);
  return p + Math.pow(c,2);
}
