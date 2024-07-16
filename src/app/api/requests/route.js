import { getXataClient } from "@/xata";

const xata = getXataClient();

export default async function handler(req, res) {
  const { method } = req;
  const params = Object.fromEntries(req.query.entries());

  switch (method) {
    case "GET":
      try {
        const data = await xata.db.requests.getMany(params);
        console.log("GET 요청 데이터:", data); // 콘솔에 반환되는 데이터 출력
        res.status(200).json({ requests: data });
      } catch (error) {
        console.error("데이터 불러오기 오류:", error);
        res.status(500).json({ error: "데이터 불러오기 오류" });
      }
      break;

    case "POST":
      try {
        const body = req.body;
        console.log("POST 요청 데이터:", body); // 콘솔에 요청 데이터 출력
        const data = await xata.db.requests.create(body);
        console.log("저장된 데이터:", data); // 콘솔에 저장된 데이터 출력
        res.status(201).json(data);
      } catch (error) {
        console.error("데이터 저장 오류:", error);
        res.status(500).json({ error: "데이터 저장 오류" });
      }
      break;

    case "PATCH":
      try {
        const body = req.body;
        const data = await xata.db.requests.update(params.id, body);
        res.status(200).json(data);
      } catch (error) {
        console.error("데이터 업데이트 오류:", error);
        res.status(500).json({ error: "데이터 업데이트 오류" });
      }
      break;

    case "DELETE":
      try {
        const data = await xata.db.requests.delete(params.id);
        res.status(200).json(data);
      } catch (error) {
        console.error("데이터 삭제 오류:", error);
        res.status(500).json({ error: "데이터 삭제 오류" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
