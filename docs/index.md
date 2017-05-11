# Noisy

A noise node for Web Audio API.

## Why would I need a noise node?

If you want to simply generate white noise, I really wouldn't recommend you to use this. 
You would have to include another file, another lib, just for creating noise. 
BUT, Noisy lets you configure your noise, setting the frequency range of your noise.
If and only if this is what you're looking for, I recommend it to you.

## How do I use this?

```javascript
  var audio_context = new (window.AudioContext || window.webkitAudioContext)();
  var n = new Noisy(audio_context); 
  var node = n.createNoise(100,1000);
  node.start(); 
  node.connect(audio_context.destination);
  node.stop(2);
```

First argument of `createNoise` is the lower bound, second is the upper bound.
By this I mean: lowest frequency (in Hz) present in the spectrum will be first argument, highest frequency (in Hz) is second argument.

If you let `createNoise` without parameters it will be plain white noise.
If you make lower bound less than 0, it'll be set as 0.
If you make upper bound greater than Nyquist frequency (sampleRate/2), it'll be set as the Nyquist frequency.

When creating `Noisy()` object, the argument is an AudioContext object. If nothing is passed, an exception is thrown.

Don't forget to include the lib in your project. A minified version can be downloaded [here](https://raw.githubusercontent.com/fabiogoro/noisy/master/noisy.min.js).

You can use the git cdn also.

```
<script type="text/javascript" src="https://cdn.rawgit.com/fabiogoro/noisy/master/noisy.min.js"></script>
```

## This is too much trouble...

If all you want is to hear some noise from your browser, this is enough coding:

```html
<html>
<script type="text/javascript" src="https://cdn.rawgit.com/fabiogoro/noisy/master/noisy.min.js"></script>
<script>
var audio_context = new (window.AudioContext || window.webkitAudioContext)();
var n = new Noisy(audio_context);
var node = n.createNoise();
node.start();
node.connect(audio_context.destination);
</script>
</html>
```

## License

This project is licensed under the terms of the MIT license.
