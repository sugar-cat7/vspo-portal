import { App, AppContext } from './pkg/hono';
import { videoProcessor, eventProcessor } from './pkg/processor';
import { translateText } from './pkg/translator';

export const registerOldAPIProxyRoutes = (app: App) => {
    app.get('*', async (c: AppContext) => {
        const response = await fetch(c.get('requestUrl'), { ...c.req.raw, headers: c.req.header() });
        const data = await response.json();
        // Event...
        if (c.req.path.includes('events')) {
            const translatedData = await eventProcessor(c, data);
            return c.json(translatedData);
        }

        // Livestream, freechat, clip.....
        const translatedData = await videoProcessor(c, data);

        // background translation
        c.executionCtx.waitUntil(
            Promise.all(
                translatedData
                    .filter(item => !item.titleTranslated)
                    .map(item =>
                        translateText(c, item.title, c.req.query('lang') || 'ja', item.id)
                    )
            )
        );
        // Return the translated data
        return c.json(translatedData);
    });
}
