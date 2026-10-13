function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');

  const btn = document.getElementById('darkModeBtn');
  if (document.body.classList.contains('dark-mode')) {
    btn.textContent = '☀️ ปิดโหมดกลางคืน';
  } else {
    btn.textContent = '🌙 เปิดโหมดกลางคืน';
  }
}
