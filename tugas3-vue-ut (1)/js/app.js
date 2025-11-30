new Vue({
  el: '#app',
  data: { tab: 'stok' }
});

function showToast(message = "Data berhasil disimpan!") {
  const t = document.getElementById("toast");
  t.textContent = message;
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2000); // hilang setelah 2 detik
}
