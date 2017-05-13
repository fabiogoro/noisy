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

QUnit.test( "Throws when arg1>arg2, returns buffer otherwise", function( assert ) {
  var n = new Noisy(audio_context); 
  assert.throws(function(){n.createNoise(101,100);}, "Passed!");
  var node = n.createNoise(100,101);
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


function freqbin(hz){
  var n = new Noisy(audio_context); 
  return 2*n.freqbin(hz);
}
