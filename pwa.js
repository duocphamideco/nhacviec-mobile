(() => {
  const button = document.getElementById('install-pwa');
  const dialog = document.getElementById('pwa-help');
  const status = document.getElementById('pwa-status');
  let installEvent = null;
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const refresh = () => { button.hidden = standalone(); };
  refresh();
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; refresh(); });
  window.addEventListener('appinstalled', () => { installEvent = null; button.hidden = true; });
  button.addEventListener('click', async () => {
    if (!installEvent) { dialog.showModal(); return; }
    const pending = installEvent; installEvent = null;
    try { await pending.prompt(); await pending.userChoice; }
    catch (e) { status.textContent = 'Hãy dùng menu trình duyệt để thêm ứng dụng.'; dialog.showModal(); }
  });
  if ('serviceWorker' in navigator && window.isSecureContext && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'})
        .catch(() => { status.textContent = 'Chưa chuẩn bị được bộ cài. Kiểm tra đã tải đủ sw.js, manifest.json và các file biểu tượng PNG lên website.'; });
    });
  } else { status.textContent = 'Vui lòng mở ứng dụng từ website HTTPS để cài đặt.'; }
})();
