const title = 'Hamlet, Act III, Scene I [To be, or not to be]';
const url = window.location.href.split('#')[0];
document.getElementById('facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
document.getElementById('twitter').href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
document.getElementById('tumblr').href = `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}`;
document.getElementById('print').addEventListener('click', () => window.print());
document.getElementById('copy').addEventListener('click', async () => {
  const code = `<blockquote cite="${url}">${title} — William Shakespeare</blockquote>`;
  await navigator.clipboard.writeText(code);
  document.getElementById('message').textContent = 'Embed code copied.';
});
document.getElementById('anthology').addEventListener('click', () => {
  localStorage.setItem('verse-anthology-hamlet', 'saved');
  document.getElementById('message').textContent = 'Added to your local anthology.';
});
