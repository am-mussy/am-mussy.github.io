/*
subdomain
email
phone
widgetId
username
action: init
*/
const botToken = '1254971228:AAHRHnwFp0yeJmKCHrT2gC06cwWAmtaWvwI';
const Telegram = require('telegraf/telegram');
const telegram = new Telegram(botToken);

const mongoose = require('mongoose');

mongoose.connect(
  'mongodb://user:PaVDDimA9pCeVWrQzpkhTnQRV8TdG26FYh4jdsZNarzp26yBmi@188.120.254.126/tasks-widget',
  {
    useUnifiedTopology: true,
    keepAlive: true,
    useNewUrlParser: true,
  }
);

const Widget = mongoose.model('widget', {
  subdomain: String,
  email: String,
  phone: String,
  widgetId: String,
  username: String,
  trialStart: Date,
  status: String,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (
    !req.body ||
    !req.body.subdomain ||
    !req.body.widgetId ||
    !req.body.username ||
    !req.body.action
  ) {
    return res.status(400).send('not correct data');
  }

  console.log({ body: req.body });

  telegram.sendMessage(295661166, JSON.stringify(req.body));

  telegram.sendMessage(179758893, JSON.stringify(req.body));

  let widget;

  widget = await Widget.findOne({ subdomain: req.body.subdomain });

  console.log('1', { widget });

  if (!widget && req.body.source !== 'render') {
    console.log('no widget, create new one');
    widget = await Widget.create({
      name: 'tasks',
      subdomain: req.body.subdomain,
      phone: req.body.phone,
      email: req.body.email,
      status: 'new',
    });

    console.log('created widget', { widget });
  }

  if (req.body.action === 'trialStart' && widget.status === 'trial') {
    console.log('trialStart && trial');
  } else {
    widget.phone = req.body.phone;
    widget.username = req.body.username;

    if (req.body.action === 'trialStart') {
      console.log('new trial start');
      widget.trialStart = Date.now();
      widget.status = 'trial';
      if (req.body.email) widget.email = req.body.email;
      if (req.body.phone) widget.phone = req.body.phone;
    }

    console.log('widget to save', { widget });

    await widget.save();
  }

  if (widget.trialStart)
    widget.trialStart = widget.trialStart.getMilliseconds();

  res.json(widget);
};
