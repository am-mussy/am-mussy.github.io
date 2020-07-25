/*
subdomain
email
phone
widgetId
username
action: init
*/

const faunadb = require('faunadb'),
  q = faunadb.query;

const client = new faunadb.Client({
  secret: 'fnADuUBEQJACBpq9WNuYE_7ZMKXn_E-K7_aoUjP9',
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept')

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!req.body || !req.body.subdomain || !req.body.widgetId || !req.body.username || !req.body.action) {
    return res.status(400).send('not correct data');
  }


  let widget;
  try {
    widget = await client.query(
      q.Get(q.Match(q.Index('widgets_by_subdomain'), req.body.subdomain))
    );
  } catch (error) {
    widget = await client.query(
      q.Create(q.Collection('widgets'), {
        data: {
          name: 'tasks',
          subdomain: req.body.subdomain,
          phone: req.body.phone,
          email: req.body.email,
          status: 'new'
        },
      })
    );

  }

  if (req.body.action === 'trialStart' && widget.data.status === 'trial') {
    return res.json(widget.data)
  }

  const updateData  =  { phone: req.body.phone, username: req.body.username }

  if (req.body.action === 'trialStart') {
    updateData.trialStart = Date.now()
    updateData.status = 'trial'
    if (req.body.email) updateData.email = req.body.email
    if (req.body.phone) updateData.phone = req.body.phone
  }

  const w = await client.query(
    q.Update(
      q.Ref(q.Collection('widgets'), widget.ref.id),{ data: updateData }
    )
  )

  res.json(w.data);
};
