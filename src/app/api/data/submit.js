let storedData = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    storedData = req.body;
    res.status(200).json({ message: 'Data received' });
  } else if (req.method === 'GET') {
    res.status(200).json(storedData);
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
