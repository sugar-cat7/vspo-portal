import { App, AppContext } from './pkg/hono';
import { videoProcessor, eventProcessor } from './pkg/processor';

export const registerOldAPIProxyRoutes = (app: App) => {
    app.get('*', async (c: AppContext) => {
        // Send request to Backend API
        const channelId = c.req.query('channelId')
        const requestUrl = channelId ? c.get('requestUrl') + `?channelId=${channelId}` : c.get('requestUrl');
        const response = await fetch(requestUrl, { ...c.req.raw });
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
