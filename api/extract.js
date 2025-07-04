const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

  console.log('Fetching URL:', url);
  try {
    const resp = await fetch(url);
    console.log('Status da resposta:', resp.status);

    const body = await resp.text();
    if (!resp.ok) {
      console.error('Falha ao buscar:', body);
      return res.status(502).json({ error: 'Erro ao buscar página', details: body.slice(0, 200) });
    }

    const $ = cheerio.load(body);
    const links = [];

    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src && /\.(mp4|m3u8)/i.test(src)) links.push(src);
    });

    $('script').each((_, el) => {
      const txt = $(el).html() || '';
      const arr = txt.match(/https?:\/\/[^'"]+\.(mp4|m3u8)/gi);
      if (arr) arr.forEach(u => links.push(u));
    });

    res.json({ links: [...new Set(links)] });

  } catch (err) {
    console.error('Erro interno:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
};
