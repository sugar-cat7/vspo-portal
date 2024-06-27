import { App, AppContext } from './pkg/hono';
import { videoProcessor, eventProcessor } from './pkg/processor';

export const registerOldAPIProxyRoutes = (app: App) => {
    app.get('*', async (c: AppContext) => {
        // Send request to Backend API
        const response = await fetch(c.get('requestUrl'), { headers: c.req.raw.headers });

        // Event...
        if (c.req.path.includes('events') || c.req.path.includes('clips')) {
            return response
            // const translatedData = await eventProcessor(c, data);
            // return c.json(translatedData);
        }

        // Parse response to JSON
        const data = await response.json();

        // Livestream, freechat, clip.....
        const translatedData = await videoProcessor(c, data);

        // Return the translated data
        return c.json(translatedData);
    });
}
