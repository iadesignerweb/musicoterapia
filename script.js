// Envio do formulário de cadastro
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const popup = document.getElementById('popup');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('nome').value.trim();
      const numero = document.getElementById('numero').value.trim();

      if (!nome || !numero) {
        showPopup("Por favor, preencha todos os campos.");
        return;
      }

      try {
        const response = await fetch('/cadastro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nome, numero })
        });

        const data = await response.json();

        if (response.ok) {
          showPopup(data.message || "Cadastro realizado com sucesso!");
          form.reset();
        } else {
          showPopup(data.error || "Erro ao enviar dados.");
        }
      } catch (error) {
        showPopup("Erro de conexão com o servidor.");
        console.error(error);
      }
    });
  }

  // Login Admin
  const adminForm = document.getElementById('adminForm');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senha = document.getElementById('senha').value;
      if (senha === 'wifire2025') {
        window.location.href = "/painel.html";
      } else {
        showPopup("Acesso restrito. Senha incorreta.");
      }
    });
  }

  function showPopup(message) {
    popup.innerText = message;
    popup.style.display = 'block';
    setTimeout(() => {
      popup.style.display = 'none';
    }, 3500);
  }
});
