import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = true;
env.useBrowserCache = true;
env.allowRemoteModels = true;

class MyTranslationPipeline {
    static task = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function handler(event) {
    try {
        const { text, src_lang, tgt_lang } = JSON.parse(event.body);
        
        let translator = await MyTranslationPipeline.getInstance();

        const startTime = performance.now();

        let output = await translator(text, {
            tgt_lang,
            src_lang,
        });

        const endTime = performance.now();
        const translationTime = (endTime - startTime) / 1000;

        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 'complete',
                output,
                translationTime
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: error.message
            })
        };
    }
}
