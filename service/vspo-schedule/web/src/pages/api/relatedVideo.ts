import { fetchRelatedVideos } from "@/lib/api";
import { validateGetRequest } from "@/lib/validator";
import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  validateGetRequest(req, res, async () => {
    // クエリパラメータからページ数とリミット数を取得。指定がなければデフォルトの値として1と10を設定
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const relatedVideos = await fetchRelatedVideos(page, limit);

    // Cache-Controlヘッダーを設定
    res.setHeader("Cache-Control", "s-maxage=10800, stale-while-revalidate");

    res.status(200).json(relatedVideos);
  });
};
