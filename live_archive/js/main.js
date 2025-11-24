// Spotify の通常 URL から embed 用 iframe HTML を生成する
function createSpotifyEmbedHtml(url) {
  if (!url) return '';

  // 例:
  // https://open.spotify.com/playlist/7JUG7NdQZkikHCzxTgXT95?si=...
  // https://open.spotify.com/intl-ja/album/6bMTvsdVcSvYMkib8VKSTU?si=...
  const match = url.match(
    /^https?:\/\/open\.spotify\.com\/(?:intl-[^/]+\/)?(playlist|album|track|artist|show|episode)\/([a-zA-Z0-9]+)/
  );

  if (!match) {
    console.warn('Spotify URL の形式が想定外です:', url);
    return '';
  }

  const type = match[1]; // playlist / album / track / ...
  const id = match[2];

  const embedSrc = `https://open.spotify.com/embed/${type}/${id}`;

  return `<iframe src="${embedSrc}" allow="encrypted-media"></iframe>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.getElementById('timeline');
  const events = [];

  fetch('data/lives.json')
    .then(response => response.json())
    .then(lives => {
      // 日付降順（新しい順）に並べ替え
      lives.sort((a, b) => new Date(b.date) - new Date(a.date));

      let currentYear = '';

      lives.forEach(live => {
        const eventYear = new Date(live.date).getFullYear();

        // 年が変わったら年タイトルを追加
        if (eventYear !== currentYear) {
          currentYear = eventYear;
          const yearElement = document.createElement('div');
          yearElement.className = 'year';
          yearElement.textContent = eventYear;
          timeline.appendChild(yearElement);
        }

        // イベント本体
        const now = new Date();
        const statusClass = new Date(live.date) > now ? 'upcoming' : 'past';
        const dateDisplay = live.date.slice(5); // "MM-DD"だけ取り出す

        const eventElement = document.createElement('div');
        eventElement.className = `event ${statusClass}`;
        eventElement.innerHTML = `
          <div class="date">${dateDisplay}</div>
          <div class="content">
            <h3>${live.artist} @ ${live.venue}</h3>
            <h4>${live.title || ''}</h4>
            <p>${live.desc || ''}</p>
            ${live.spotify ? createSpotifyEmbedHtml(live.spotify) : ''}
          </div>
        `;

        timeline.appendChild(eventElement);
        events.push(eventElement);
      });

      // スクロールしたら表示アニメーション
      const revealOnScroll = () => {
        events.forEach(event => {
          const rect = event.getBoundingClientRect();
          if (rect.top < window.innerHeight - 100) {
            event.classList.add('visible');
          }
        });
      };

      window.addEventListener('scroll', revealOnScroll);
      revealOnScroll(); // 初回も実行
    })
    .catch(error => {
      console.error('ライブデータの読み込みに失敗しました:', error);
    });
});
