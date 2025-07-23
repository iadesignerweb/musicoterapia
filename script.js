document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const phone = document.getElementById('phone').value;
  const responseEl = document.getElementById('response');

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    const data = await res.json();
    responseEl.textContent = data.message;
    responseEl.style.color = data.success ? 'green' : 'red';
  } catch (error) {
    responseEl.textContent = 'Erro ao conectar. Tente novamente.';
    responseEl.style.color = 'red';
  }
});
