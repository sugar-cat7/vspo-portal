import { App, AppContext } from './pkg/hono';
import { videoProcessor, eventProcessor } from './pkg/processor';

export const registerOldAPIProxyRoutes = (app: App) => {
    app.get('*', async (c: AppContext) => {
        // Send request to Backend API
        const response = await fetch(c.get('requestUrl'), { headers: c.req.raw.headers });

        // Parse response to JSON
        const data = await response.json();

        // Event...
        if (c.req.path.includes('events')) {
            return response
            // const translatedData = await eventProcessor(c, data);
            // return c.json(translatedData);
        }

        // Livestream, freechat, clip.....
        const translatedData = await videoProcessor(c, data);

        // Return the translated data
        return c.json(translatedData);
    });
}
