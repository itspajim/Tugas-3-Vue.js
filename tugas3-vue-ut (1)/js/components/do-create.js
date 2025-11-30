Vue.component("do-create", {
  props: ["dataUrl"],
  data() {
    return {
      form: {
        nim: "",
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0
      },
      pengirimanList: [],
      paketList: [],
      paketDetail: null,
      trackingList: [], 
    };
  },

  created() {
    ApiService.fetchAll(this.dataUrl).then((d) => {
      this.pengirimanList = d.pengirimanList;
      this.paketList = d.paket;
      this.trackingList = d.tracking;
    });
  },

  methods: {
    onPaketSelected() {
      this.paketDetail = this.paketList.find(p => p.kode === this.form.paket);
      if (this.paketDetail) {
        this.form.total = this.paketDetail.harga;
      }
    },

    generateDO() {
      const year = new Date().getFullYear();
      const seq = this.trackingList.length + 1;
      return `DO${year}-${String(seq).padStart(4, "0")}`;
    },

    saveDO() {
      if (!this.form.nim || !this.form.nama || !this.form.paket) {
        showToast("Mohon lengkapi NIM, Nama, dan Paket!");
        return;
      }

      const doNumber = this.generateDO();

      const newDO = {
        [doNumber]: {
          nim: this.form.nim,
          nama: this.form.nama,
          ekspedisi: this.form.ekspedisi,
          paket: this.form.paket,
          tanggalKirim:
            this.form.tanggalKirim || new Date().toISOString().slice(0, 10),
          total: this.form.total,
          perjalanan: [
            {
              waktu: new Date().toISOString().slice(0, 19).replace("T", " "),
              keterangan: "DO dibuat",
            },
          ],
        },
      };

      this.trackingList.push(newDO);

      showToast("Delivery Order berhasil disimpan!");

      this.form = {
        nim: "",
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0
      };
    },
  },

  template: `
  <div>
      <h1 style="text-align: center;">Tambah Delivery Order</h1>
      <div>
        <div class="form-inline">
          <label>NIM</label>
          <input v-model="form.nim" style="margin-left:45px;"/>
        </div>
        <div class="form-inline">  
          <label>Nama</label>
          <input v-model="form.nama" style="margin-left:36px;"/>
        </div>
        <div class="form-inline">
          <label>Pengiriman</label>
          <select v-model="form.ekspedisi">
            <option v-for="p in pengirimanList" :key="p.kode" :value="p.nama">{{p.nama}}</option>
          </select>
        
          <input type="date" v-model="form.tanggalKirim" />
        </div>
        <div class="form-inline">
          <select v-model="form.paket" @change="onPaketChange">
            <option value="">-- Pilih Paket --</option>
            <option v-for="p in paket" :key="p.kode" :value="p.kode">{{p.kode}} - {{p.nama}}</option>
          </select>

        </div>

    <button class="btn primary" style="margin-top:15px;" @click="saveDO">
      Simpan DO
    </button>
  </div>
  `
});
