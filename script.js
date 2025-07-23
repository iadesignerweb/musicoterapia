document.addEventListener('DOMContentLoaded', () => {
  console.log("WiFire Conecta iniciado!");

  // Exemplo de animação leve
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = 1;
      card.style.transform = 'translateY(0)';
    }, 200 * i);
  });

  // 🚀 Preparação para futura integração com bot ou dashboard
  // Aqui você pode incluir chamadas para o Telegram bot ou API do dashboard
});
