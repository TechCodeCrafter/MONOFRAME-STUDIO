/**
 * FFmpeg Web Worker
 * Handles video processing in a separate thread to avoid blocking the main UI
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoaded = false;

/**
 * Message types for worker communication
 */
type WorkerMessage =
  | { type: 'load'; baseURL?: string }
  | { type: 'run'; args: string[] }
  | { type: 'runMultiple'; commands: Array<{ id: string; args: string[] }> }
  | { type: 'writeFile'; name: string; data: Uint8Array }
  | { type: 'readFile'; name: string }
  | { type: 'deleteFile'; name: string }
  | { type: 'listFiles' };

type WorkerResponse =
  | { type: 'loaded'; success: boolean; error?: string }
  | { type: 'log'; message: string }
  | { type: 'progress'; ratio: number }
  | { type: 'done'; success: boolean; error?: string }
  | { type: 'commandProgress'; commandId: string; commandIndex: number; totalCommands: number }
  | { type: 'allDone'; success: boolean; error?: string }
  | { type: 'fileWritten'; success: boolean }
  | { type: 'fileData'; data: Uint8Array; name: string }
  | { type: 'fileDeleted'; success: boolean }
  | { type: 'fileList'; files: string[] };

/**
 * Initialize FFmpeg instance
 */
async function loadFFmpeg(baseURL?: string): Promise<void> {
  if (isLoaded && ffmpeg) {
    return;
  }

  try {
    ffmpeg = new FFmpeg();

    // Set up logging
    ffmpeg.on('log', ({ message }) => {
      postMessage({ type: 'log', message } as WorkerResponse);
    });

    // Set up progress tracking
    ffmpeg.on('progress', ({ progress }) => {
      postMessage({ type: 'progress', ratio: progress } as WorkerResponse);
    });

    // Load FFmpeg core
    const coreURL = await toBlobURL(
      baseURL || 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
      'text/javascript'
    );
    const wasmURL = await toBlobURL(
      baseURL || 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
      'application/wasm'
    );

    await ffmpeg.load({
      coreURL,
      wasmURL,
    });

    isLoaded = true;
    postMessage({ type: 'loaded', success: true } as WorkerResponse);
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    postMessage({
      type: 'loaded',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as WorkerResponse);
  }
}

/**
 * Run FFmpeg command
 */
async function runFFmpeg(args: string[]): Promise<void> {
  if (!ffmpeg || !isLoaded) {
    postMessage({
      type: 'done',
      success: false,
      error: 'FFmpeg not loaded',
    } as WorkerResponse);
    return;
  }

  try {
    await ffmpeg.exec(args);
    postMessage({ type: 'done', success: true } as WorkerResponse);
  } catch (error) {
    console.error('FFmpeg execution error:', error);
    postMessage({
      type: 'done',
      success: false,
      error: error instanceof Error ? error.message : 'Execution failed',
    } as WorkerResponse);
  }
}

/**
 * Run multiple FFmpeg commands in sequence
 */
async function runMultipleFFmpeg(
  commands: Array<{ id: string; args: string[] }>
): Promise<void> {
  if (!ffmpeg || !isLoaded) {
    postMessage({
      type: 'allDone',
      success: false,
      error: 'FFmpeg not loaded',
    } as WorkerResponse);
    return;
  }

  try {
    const totalCommands = commands.length;
    
    for (let i = 0; i < totalCommands; i++) {
      const { id, args } = commands[i];
      
      // Notify progress
      postMessage({
        type: 'commandProgress',
        commandId: id,
        commandIndex: i,
        totalCommands,
      } as WorkerResponse);
      
      // Run command
      await ffmpeg.exec(args);
    }
    
    postMessage({ type: 'allDone', success: true } as WorkerResponse);
  } catch (error) {
    console.error('FFmpeg multi-execution error:', error);
    postMessage({
      type: 'allDone',
      success: false,
      error: error instanceof Error ? error.message : 'Execution failed',
    } as WorkerResponse);
  }
}

/**
 * Write file to FFmpeg virtual filesystem
 */
async function writeFile(name: string, data: Uint8Array): Promise<void> {
  if (!ffmpeg || !isLoaded) {
    postMessage({ type: 'fileWritten', success: false } as WorkerResponse);
    return;
  }

  try {
    await ffmpeg.writeFile(name, data);
    postMessage({ type: 'fileWritten', success: true } as WorkerResponse);
  } catch (error) {
    console.error('Failed to write file:', error);
    postMessage({ type: 'fileWritten', success: false } as WorkerResponse);
  }
}

/**
 * Read file from FFmpeg virtual filesystem
 */
async function readFile(name: string): Promise<void> {
  if (!ffmpeg || !isLoaded) {
    postMessage({
      type: 'fileData',
      data: new Uint8Array(),
      name,
    } as WorkerResponse);
    return;
  }

  try {
    const data = await ffmpeg.readFile(name);
    // Handle different possible return types from readFile
    let uint8Data: Uint8Array;
    if (data instanceof Uint8Array) {
      uint8Data = data;
    } else if (typeof data === 'string') {
      // Convert string to Uint8Array
      const encoder = new TextEncoder();
      uint8Data = encoder.encode(data);
    } else {
      // Assume it's an ArrayBuffer-like object
      uint8Data = new Uint8Array(data as ArrayBuffer);
    }
    
    postMessage({
      type: 'fileData',
      data: uint8Data,
      name,
    } as WorkerResponse);
  } catch (error) {
    console.error('Failed to read file:', error);
    postMessage({
      type: 'fileData',
      data: new Uint8Array(),
      name,
    } as WorkerResponse);
  }
}

/**
 * Delete file from FFmpeg virtual filesystem
 */
async function deleteFile(name: string): Promise<void> {
  if (!ffmpeg || !isLoaded) {
    postMessage({ type: 'fileDeleted', success: false } as WorkerResponse);
    return;
  }

  try {
    await ffmpeg.deleteFile(name);
    postMessage({ type: 'fileDeleted', success: true } as WorkerResponse);
  } catch (error) {
    console.error('Failed to delete file:', error);
    postMessage({ type: 'fileDeleted', success: false } as WorkerResponse);
  }
}

/**
 * List all files in FFmpeg virtual filesystem
 */
async function listFiles(): Promise<void> {
  if (!ffmpeg || !isLoaded) {
    postMessage({ type: 'fileList', files: [] } as WorkerResponse);
    return;
  }

  try {
    const files = await ffmpeg.listDir('/');
    postMessage({
      type: 'fileList',
      files: files.map((f) => f.name),
    } as WorkerResponse);
  } catch (error) {
    console.error('Failed to list files:', error);
    postMessage({ type: 'fileList', files: [] } as WorkerResponse);
  }
}

/**
 * Message handler
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  switch (type) {
    case 'load':
      await loadFFmpeg(event.data.baseURL);
      break;
    case 'run':
      await runFFmpeg(event.data.args);
      break;
    case 'runMultiple':
      await runMultipleFFmpeg(event.data.commands);
      break;
    case 'writeFile':
      await writeFile(event.data.name, event.data.data);
      break;
    case 'readFile':
      await readFile(event.data.name);
      break;
    case 'deleteFile':
      await deleteFile(event.data.name);
      break;
    case 'listFiles':
      await listFiles();
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};

