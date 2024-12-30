# Generative AI Node.js bindings (preview)

## DISCLAIMER

This is preview version, do not use it in production!

## Quick Start

Install the **generative-ai-node** package:
```bash
npm install generative-ai-node
```

Use the **generative-ai-node** package:
```js
import { Pipeline } from 'generative-ai-node';

const pipe = await Pipeline.LLMPipeline(MODEL_PATH, device);

const input = 'What is the meaning of life?';
const config = { 'max_new_tokens': 100 };

await pipe.startChat();
const result = await pipe.generate(input, config, streamer);
await pipe.finishChat();

// Output all generation result
console.log(result);

function streamer(subword) {
  process.stdout.write(subword);
}
```

### Requirements

- Node.js v21+
- Tested on Ubuntu, another OS didn't tested yet
