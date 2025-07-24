document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const numero = document.getElementById("numero").value;

  fetch("https://wifire-bot.onrender.com/cadastro", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, numero }),
  })
    .then((res) => {
      if (res.ok) {
        alert("Cadastro enviado com sucesso!");
      } else {
        alert("Erro ao enviar cadastro.");
      }
    })
    .catch((err) => {
      alert("Erro na conexão.");
      console.error(err);
    });
});
