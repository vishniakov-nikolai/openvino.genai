import { Pipeline } from '../lib/module.js';

import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import { models } from './models.js';

const MODEL_PATH = process.env.MODEL_PATH
  || `./tests/models/${models[0].split('/')[1]}`;

describe('module', async () => {
  let pipeline = null;

  await before(async () => {
    pipeline = await Pipeline.create('LLMPipeline', MODEL_PATH, 'AUTO');

    await pipeline.startChat();
  });

  await after(async () => {
    await pipeline.finishChat();
  });

  await it('should generate "Hello world"', async () => {
    const result = await pipeline.generate(
      'Type "Hello world!" in English',
      () => {},
      { temperature: '0', max_new_tokens: '4' }
    );

    assert.strictEqual(result, 'Hello world!');
  });
});

describe('corner cases', async () => {
  it('should throw an error if pipeline is already initialized', async () => {
    const pipeline = await Pipeline.create('LLMPipeline', MODEL_PATH, 'AUTO');

    await assert.rejects(
      async () => await pipeline.init(),
      {
        name: 'Error',
        message: 'Pipeline is already initialized',
      },
    );
  });

  it('should throw an error if chat is already started', async () => {
    const pipeline = await Pipeline.create('LLMPipeline', MODEL_PATH, 'AUTO');

    await pipeline.startChat();

    await assert.rejects(
      () => pipeline.startChat(),
      {
        name: 'Error',
        message: 'Chat is already started',
      },
    );
  });

  it('should throw an error if chat is not started', async () => {
    const pipeline = await Pipeline.create('LLMPipeline', MODEL_PATH, 'AUTO');

    await assert.rejects(
      () => pipeline.finishChat(),
      {
        name: 'Error',
        message: 'Chat is not started',
      },
    );
  });
});

describe('generation parameters validation', () => {
  let pipeline = null;

  before(async () => {
    pipeline = await Pipeline.create('LLMPipeline', MODEL_PATH, 'AUTO');

    await pipeline.startChat();
  });

  after(async () => {
    await pipeline.finishChat();
  });

  it('should throw an error if temperature is not a number', async () => {
    await assert.rejects(
      async () => await pipeline.generate(),
      {
        name: 'Error',
        message: 'Prompt must be a string',
      },
    );
  });

  it('should throw an error if generationCallback is not a function', async () => {
    const pipeline = await Pipeline.create('LLMPipeline', MODEL_PATH, 'AUTO');

    await pipeline.startChat();

    await assert.rejects(
      async () => await pipeline.generate('prompt'),
      {
        name: 'Error',
        message: 'Generation callback must be a function',
      },
    );
  });

  it('should throw an error if options specified but not an object', async () => {
    await assert.rejects(
      async () => await pipeline.generate('prompt', () => {}, 'options'),
      {
        name: 'Error',
        message: 'Options must be an object',
      },
    );
  });

  it('should perform generation with default options', async () => {
    try {
      await pipeline.generate('prompt', () => {}, { max_new_tokens: 1 });
    } catch (error) {
      assert.fail(error);
    }

    assert.ok(true);
  });

  it('should return a string as generation result', async () => {
    const reply = await pipeline.generate('prompt', () => {}, { max_new_tokens: 1 });

    assert.strictEqual(typeof reply, 'string');
  });

  it('should call generationCallback with string chunk', async () => {
    await pipeline.generate('prompt', (chunk) => {
      assert.strictEqual(typeof chunk, 'string');
    }, { max_new_tokens: 1 });
  });
});