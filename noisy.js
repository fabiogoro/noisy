function Noisy(audio_context){
  if(audio_context===undefined || audio_context.constructor!=AudioContext) throw new Error("Argument 1 is not an AudioContext.")
  this.audio_context = audio_context;
  this._size = 65536;
  this._fft = new FFTJS(this._size);
}
Noisy.prototype.createNoise = function (bottom, top, gain){
  const spectrum = this._noise_spectrum(bottom, top, gain);
  var block = new Float32Array(this._size);
  block.set(this._noise_block(spectrum));
  return this._noise_node(block);
}

Noisy.prototype.freqbin = function (hz){
  return Math.round(hz*this._size/audio_context.sampleRate);
}

Noisy.prototype._noise_spectrum = function (bottom, top, gain){
  const audio_context = this.audio_context;
  if(bottom===undefined && top===undefined){
    bottom=0; top=audio_context.sampleRate/2;
  }
  if(gain===undefined) gain = 0.1;
  if(bottom===undefined || bottom < 0) bottom = 0;
  if(top===undefined || bottom > top) top = bottom;
  if(top > audio_context.sampleRate/2) top = audio_context.sampleRate/2;
  const size = this._size;
  const fft = this._fft;
  const out = fft.createComplexArray();
  const bottom_bin = this.freqbin(bottom);
  const top_bin = this.freqbin(top);
  var norm = 0;
  out.fill(0);
  for (var i = bottom_bin; i <= top_bin; i++) {
    var rand = Math.random()-0.5;
    if(i==0 || i==size/2) {
      out[2*i]=2*rand;
      norm += Math.pow(2*rand,2);
    }
    else {
      out[2*i] = rand;
      out[2*size-2*(i-1)-2] = rand;
      norm += Math.pow(2*rand,2);
    }
  }
  var n = 1/gain*Math.sqrt(norm)/size;
  for (var i = bottom_bin; i <= top_bin; i++) {
    if(i==0 || i==size/2) out[2*i] /= n;
    else {
      out[2*i] /= n;
      out[2*size-2*(i-1)-2] /= n;
    }
  }
  return out;
}

Noisy.prototype._noise_block = function (spectrum){
  const fft = this._fft;
  const c = fft.createComplexArray();
  fft.inverseTransform(c,spectrum);
  return new Float32Array(fft.fromComplexArray(c));
}

Noisy.prototype._noise_node = function (block){
  const audio_context = this.audio_context;
  var noise_node = audio_context.createBufferSource();
  var noise_buffer = audio_context.createBuffer(1, block.length, audio_context.sampleRate);
  noise_buffer.copyToChannel(block,0);
  noise_node.buffer = noise_buffer;
  noise_node.loop = true;
  return noise_node;
}
