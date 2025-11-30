/**
 * status-badge.js
 * * Komponen Vue.js untuk menampilkan status stok (Kosong, Menipis, Aman).
 * Mengatasi masalah tipe data String ("0") yang dibaca sebagai angka 0.
 * * Pemanggilan di HTML harus menggunakan v-bind (:)
 * Contoh: <status-badge :qty="stokBarang" :safety="10"></status-badge>
 */
Vue.component('status-badge', {
  // Prop dianjurkan didefinisikan dengan tipe data yang eksplisit untuk validasi.
  props: {
    qty: {
      type: [Number, String], // Menerima Number atau String
      required: true
    },
    safety: {
      type: [Number, String],
      required: true
    }
  },
  
  template: '<span :class="badgeClass" class="badge">{{text}}</span>',
  
  computed: {
    // Properti terhitung untuk menampilkan teks status
    text() {
      // 1. Konversi qty menjadi angka untuk perbandingan yang akurat
      const currentQty = Number(this.qty); 
      
      if (currentQty === 0) {
        return 'Kosong'; // Kondisi ini sekarang akan terpenuhi jika qty adalah angka 0
      }
      
      // Pastikan safety juga dikonversi jika masuk sebagai string
      if (currentQty < Number(this.safety)) {
        return 'Menipis';
      }
      
      return 'Aman';
    },
    
    // Properti terhitung untuk menentukan kelas CSS badge
    badgeClass() {
      // 1. Konversi qty menjadi angka
      const currentQty = Number(this.qty);
      
      if (currentQty === 0) {
        return 'empty'; // Kelas CSS untuk Kosong
      }
      
      if (currentQty < Number(this.safety)) {
        return 'low'; // Kelas CSS untuk Menipis
      }
      
      return 'safe'; // Kelas CSS untuk Aman
    }
  }
});