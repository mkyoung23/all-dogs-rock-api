import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.NEW_REPLICATE_API_KEY,
});

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const prediction = await replicate.predictions.get(id);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
