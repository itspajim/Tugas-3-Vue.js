Vue.component('do-tracking', {
  props: ['dataUrl'],
  template: `
  <div>
  <h1 style="text-align: center;"> TRACKING PENGIRIMAN</h1>
    <div class="controls">
      <input class="search" v-model="q" placeholder="Cari DO atau NIM (Enter untuk cari, Esc untuk reset)" @keyup.enter="search" @keyup.esc="clear" />
      <div style="margin-left:auto;">
        <button class="btn primary" @click="showAdd=true">Tambah DO</button>
      </div>
    </div>

    <div v-if="results.length===0" class="small">Tidak ada DO. Tambah data baru atau cari dengan nomor DO/NIM.</div>

    <table class="table" v-if="results.length>0">
      <thead><tr><th>Nomor DO</th><th>NIM</th><th>Nama</th><th>Ekspedisi</th><th>Tanggal Kirim</th><th>Paket</th><th>Total</th><th>Aksi</th></tr></thead>
      <tbody>
        <tr v-for="r in results" :key="r.key">
          <td>{{r.key}}</td>
          <td>{{r.data.nim}}</td>
          <td>{{r.data.nama}}</td>
          <td>{{r.data.ekspedisi}}</td>
          <td>{{ formatDate(r.data.tanggalKirim) }}</td>
          <td>{{ r.data.paket }}</td>
          <td>{{ r.data.total | currency }}</td>
          <td><button @click="showDetail(r)" class="btn">Detail</button></td>
        </tr>
      </tbody>
    </table>

    <!-- Add DO Modal -->
    <app-modal :show="showAdd">
      <h3>Tambah Delivery Order</h3>
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

        <div v-if="paketDetail">
          <p class="small">Isi paket: <strong>{{ paketDetail.isi.join(', ') }}</strong></p>
          <p class="small">Harga paket: {{ paketDetail.harga | currency }}</p>
        </div>

        <div class="actions">
          <button class="btn" @click="showAdd=false">Batal</button>
          <button class="btn primary" @click="saveDO">Simpan DO</button>
        </div>
      </div>
    </app-modal>

    <!-- Detail modal -->
    <app-modal :show="showDetailModal">
      <h3>Detail DO: {{detailKey}}</h3>
      <div v-if="detailObj">
        <p><strong>NIM:</strong> {{detailObj.nim}}</p>
        <p><strong>Nama:</strong> {{detailObj.nama}}</p>
        <p><strong>Ekspedisi:</strong> {{detailObj.ekspedisi}}</p>
        <p><strong>Tanggal Kirim:</strong> {{ formatDate(detailObj.tanggalKirim) }}</p>
        <p><strong>Progress:</strong></p>
        <ul>
          <li v-for="p in detailObj.perjalanan" :key="p.waktu">{{p.waktu}} - {{p.keterangan}}</li>
        </ul>

        <div>
          <input v-model="newProgress" placeholder="keterangan progress (Enter simpan)" @keyup.enter="addProgress" />
          <div class="actions">
            <button class="btn" @click="showDetailModal=false">Tutup</button>
          </div>
        </div>
      </div>
    </app-modal>
  </div>
  `,
  data(){
    return {
      q: '',
      rawTracking: [],
      results: [],
      pengirimanList: [],
      paket: [],
      showAdd:false,
      form: { nim:'', nama:'', ekspedisi:'', paket:'', tanggalKirim:'' },
      paketDetail: null,
      showDetailModal:false,
      detailKey: null,
      detailObj: null,
      newProgress: ''
    }
  },
  created(){
    ApiService.fetchAll(this.dataUrl).then(d=>{
      if (!d) return;
      this.rawTracking = d.tracking || [];
      this.pengirimanList = d.pengirimanList || [];
      this.paket = d.paket || [];
      this._indexRaw();
    });
    // watcher example 1: paket selection
    this.$watch('form.paket', (v)=>{ this.onPaketChange(); });
  },
  methods:{
    _indexRaw(){
      // rawTracking is array of objects with single key per item
      this.results = this.rawTracking.map(item=>{
        const key = Object.keys(item)[0];
        return { key, data: item[key] };
      });
    },
    search(){
      const q = this.q.trim().toLowerCase();
      if (!q) { this._indexRaw(); return; }
      this.results = this.rawTracking.map(item=>{
        const key = Object.keys(item)[0];
        return { key, data: item[key] };
      }).filter(r=> r.key.toLowerCase().includes(q) || r.data.nim.toLowerCase().includes(q));
    },
    clear(){
      this.q = '';
      this._indexRaw();
    },
    formatDate(d){
      if (!d) return '-';
      try {
        const dt = new Date(d);
        const opt = { day:'2-digit', month:'long', year:'numeric' };
        return dt.toLocaleDateString('id-ID', opt);
      } catch(e){ return d; }
    },
    onPaketChange(){
      this.paketDetail = this.paket.find(p=>p.kode===this.form.paket) || null;
      if (this.paketDetail) this.form.total = this.paketDetail.harga;
    },
    saveDO(){
      // simple validation
      if (!this.form.nim || !this.form.nama || !this.form.paket) { alert('Lengkapi NIM, Nama, dan Paket'); return; }
      // generate DO number: DO + year + sequence
      const year = new Date().getFullYear();
      // find existing count for year
      const seq = this.results.filter(r=> r.key.includes('DO'+year)).length + 1;
      const seqStr = String(seq).padStart(4,'0');
      const key = 'DO' + year + '-' + seqStr;
      const obj = {
        nim: this.form.nim,
        nama: this.form.nama,
        status: 'Dalam Perjalanan',
        ekspedisi: this.form.ekspedisi || (this.pengirimanList[0] && this.pengirimanList[0].nama),
        tanggalKirim: this.form.tanggalKirim || new Date().toISOString().slice(0,10),
        paket: this.form.paket,
        total: this.form.total || (this.paketDetail && this.paketDetail.harga) || 0,
        perjalanan: [
          { waktu: new Date().toISOString().slice(0,19).replace('T',' '), keterangan: 'DO dibuat' }
        ]
      };
      this.rawTracking.push({ [key]: obj });
      this._indexRaw();
      this.showAdd = false;
      this.form = { nim:'', nama:'', ekspedisi:'', paket:'', tanggalKirim:'' };
    },
    showDetail(r){
      this.detailKey = r.key;
      this.detailObj = r.data;
      this.showDetailModal = true;
    },
    addProgress(){
      if (!this.newProgress) return;
      const now = new Date().toISOString().slice(0,19).replace('T',' ');
      this.detailObj.perjalanan.push({ waktu: now, keterangan: this.newProgress });
      this.newProgress = '';
    }
  },
  filters: {
    currency(val) {
      if (val==null) return '-';
      return 'Rp ' + val.toLocaleString('id-ID');
    }
  }
});
