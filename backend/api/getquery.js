
const qs = require('qs')


module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept')

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!req.body || !req.body.filter) {
    return res.status(400).send('not correct data');
  }


  res.json({result: qs.stringify({filter: req.body.filter}) });
};
