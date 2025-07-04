const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar a página');
    const html = await response.text();
    const $ = cheerio.load(html);
    const links = [];

    $('iframe').each((_, el) => {
      const src = $(el).attr('src');
      if (src && /\.(mp4|m3u8)/.test(src)) links.push(src);
    });

    $('script').each((_, el) => {
      const txt = $(el).html() || '';
      const arr = txt.match(/https?:\/\/[^'"]+\.(mp4|m3u8)/g);
      if (arr) arr.forEach(u => links.push(u));
    });

    res.json({ links: [...new Set(links)] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
