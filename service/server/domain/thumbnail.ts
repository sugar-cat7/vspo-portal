import { z } from "zod";

const ThumbnailURLSchema = z.string().url();

export {
    ThumbnailURLSchema,
}