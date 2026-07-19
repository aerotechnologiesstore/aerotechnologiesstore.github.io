
import { pipeline, env } from '@huggingface/transformers';

// Skip local model checks since we are in a browser
env.allowLocalModels = false;
env.useBrowserCache = true;
// Point WASM to CDN so Next.js static export doesn't 404
// @ts-ignore
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.0/dist/';

class PipelineSingleton {
    static task: any = 'text-generation';
    static model = 'Xenova/SmolLM-135M-Instruct';
    static instance: any = null;

    static async getInstance(progress_callback?: any) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { type, text, systemPrompt } = event.data;
    
    if (type === 'init') {
        try {
            // Load the pipeline
            await PipelineSingleton.getInstance((x: any) => {
                // Send download progress back to main thread
                self.postMessage({ status: 'progress', data: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error: any) {
            self.postMessage({ status: 'error', error: error.message });
        }
    } 
    else if (type === 'generate') {
        try {
            const generator = await PipelineSingleton.getInstance();
            
            // Format for Qwen Chat
            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ];

            const output = await generator(messages, {
                max_new_tokens: 150,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false,
            });

            self.postMessage({ 
                status: 'complete', 
                output: output[0]?.generated_text || "I'm sorry, I couldn't generate a response."
            });
            
        } catch (error: any) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }
});
