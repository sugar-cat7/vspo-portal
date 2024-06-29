import { App, AppContext } from './pkg/hono';
import { videoProcessor, eventProcessor } from './pkg/processor';

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

        // Return the translated data
        return c.json(translatedData);
    });
}
