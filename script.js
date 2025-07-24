form.addEventListener("submit", function (e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const numero = document.getElementById("numero").value;

  fetch("http://192.168.0.106:3000/dados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, numero })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro na resposta do servidor");
      }
      return response.text();
    })
    .then((data) => {
      alert("✅ Dados enviados com sucesso!");
      form.reset();
    })
    .catch((error) => {
      alert("❌ Falha ao enviar. Verifique a conexão.");
      console.error("Erro:", error);
    });
});
