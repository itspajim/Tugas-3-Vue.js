Vue.component('ba-stock-table', {
  props: ['dataUrl'],
  template: `
  <div>
  <h1 style="text-align: center;">STOCK BAHAN AJAR</h1>
    <div class="controls">
      <select v-model="filter.upbjj" @change="onUPBJJChange">
        <option value="">-- Semua UT-Daerah --</option>
        <option v-for="u in upbjjList" :key="u" :value="u">{{u}}</option>
      </select>

      <select v-model="filter.kategori" v-if="kategoriOptions.length>0">
        <option value="">-- Semua Kategori --</option>
        <option v-for="k in kategoriOptions" :key="k" :value="k">{{k}}</option>
      </select>

      <select v-model="filter.presets">
        <option value="">-- Filter khusus --</option>
        <option value="low">Stok &lt; Safety</option>
        <option value="zero">Stok = 0</option>
      </select>

      <select v-model="sortBy">
        <option value="judul">Sort: Judul</option>
        <option value="qty">Sort: Qty</option>
        <option value="harga">Sort: Harga</option>
      </select>

      <input class="search" v-model="q" placeholder="Cari kode atau judul..." />
      <button class="btn" @click="resetFilters()">Reset</button>

      <div style="margin-left:auto;">
        <button class="btn primary" @click="showAdd=true">Tambah Bahan Ajar</button>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Kode / Judul</th>
          <th>Kategori</th>
          <th>UT-Daerah</th>
          <th>Lokasi Rak</th>
          <th>Harga</th>
          <th>Qty</th>
          <th>Safety</th>
          <th>Status</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(s, idx) in displayed" :key="s.kode">
          <td><strong>{{s.kode}}</strong><div class="small">{{s.judul}}</div></td>
          <td>{{s.kategori}}</td>
          <td>{{s.upbjj}}</td>
          <td>{{s.lokasiRak}}</td>
          <td>{{ s.harga | currency }}</td>
          <td>{{ s.qty | withUnit }}</td>
          <td>{{ s.safety | withUnit }}</td>
          <td><status-badge :qty="s.qty" :safety="s.safety"></status-badge></td>
          <td>
            <button @click="editItem(s)" class="btn">Edit</button>
            <button @click="confirmDelete(s)" class="btn danger">Delete</button>
            <span class="tooltip small" v-if="s.catatanHTML">
              <em>Hover</em>
              <span class="tip" v-html="s.catatanHTML"></span>
            </span>
          </td>
        </tr>
        <tr v-if="displayed.length===0"><td colspan="9" class="small">Tidak ada data sesuai filter.</td></tr>
      </tbody>
    </table>

    <!-- Add / Edit Modal -->
    <app-modal :show="showAdd || editing">
      <h3 v-if="showAdd">Tambah Bahan Ajar</h3>
      <h3 v-if="editing">Edit Bahan Ajar</h3>
      <div>
        <div class="form-inline">
          <label>Kode</label>
          <input v-model="form.kode" style="margin-left:27px;"/>
          </div>
          <div class="from-inline">
          <label>Judul</label>
          <input style="flex:1" v-model="form.judul" style="margin-left:29px;"/>
          </div>
        </div>
        <div class="form-inline">
         <label>Kategori</label>
          <select v-model="form.kategori" style="margin-left:3px;">
            <option v-for="k in kategoriList" :key="k" :value="k">{{k}}</option>
          </select>
        </div>
        <div>
          <label>UPBJJ</label>
          <select v-model="form.upbjj" style="margin-left:26px;">
            <option v-for="u in upbjjList" :key="u" :value="u">{{u}}</option>
          </select>
        </div>
        <div style="margin-top:8px;">
          <div class="from-inline">
            <label>Lokasi</label>
            <input v-model="form.lokasiRak" style="margin-left:24px;"/>
          </div>
          <div class="from-inline">
            <label>Harga</label>
            <input style="flex:1" v-model="form.harga" style="margin-left:26px;"/>
          </div>
          <div class="from-inline">
            <label>Quantity</label>
            <input style="flex:1" v-model="form.qty" style="margin-left:9px;"/>
          </div>
          <div style="margin-top:8px;">
          <label>Safety</label>
          <input class="input-inline" v-model.number="form.safety" placeholder="" style="margin-left:26px;"/>
          </div>
          <div style="margin-top:8px;">
          <label>Catatan</label>
          <input v-model="form.catatanHTML" placeholder="" style="margin-left:17px;"/>
          </div>
        </div>

        <div class="actions">
          <button class="btn" @click="closeModal">Batal</button>
          <button class="btn primary" @click="saveForm">Simpan</button>
        </div>
      </div>
    </app-modal>

    <!-- Confirm delete modal -->
    <app-modal :show="showConfirm">
      <h3>Konfirmasi Hapus</h3>
      <p>Anda yakin akan menghapus <strong>{{ toDelete && toDelete.kode }}</strong> ?</p>
      <div class="actions">
        <button class="btn" @click="showConfirm=false">Batal</button>
        <button class="btn danger" @click="deleteItem">Hapus</button>
      </div>
    </app-modal>
  </div>
  `,
  data() {
    return {
      raw: [],
      upbjjList: [],
      kategoriList: [],
      q: '',
      filter: { upbjj: '', kategori: '', presets: '' },
      sortBy: 'judul',
      showAdd: false,
      editing: false,
      form: {},
      toDelete: null,
      showConfirm: false
    };
  },
  created() {
    ApiService.fetchAll(this.dataUrl).then(d=>{
      if (!d) return;
      this.raw = d.stok || [];
      this.upbjjList = d.upbjjList || [];
      this.kategoriList = d.kategoriList || [];
    });

    // watchers (demonstrate at least two watchers)
    this.$watch('filter.upbjj', function(val){ console.log('filter.upbjj changed', val); });
    this.$watch('q', function(val){ console.log('search changed', val); });
  },
  computed: {
    kategoriOptions() {
      // dependent options: show kategori only if upbjj selected, otherwise show all
      return this.filter.upbjj ? this.kategoriList : [];
    },
    displayed() {
      let arr = this.raw.slice();
      if (this.q) {
        const qq = this.q.toLowerCase();
        arr = arr.filter(s => s.kode.toLowerCase().includes(qq) || s.judul.toLowerCase().includes(qq));
      }
      if (this.filter.upbjj) arr = arr.filter(s => s.upbjj===this.filter.upbjj);
      if (this.filter.kategori) arr = arr.filter(s => s.kategori===this.filter.kategori);
      if (this.filter.presets==='low') arr = arr.filter(s => s.qty < s.safety);
      if (this.filter.presets==='zero') arr = arr.filter(s => s.qty===0);
      // sort
      arr.sort((a,b)=>{
        if (this.sortBy==='judul') return a.judul.localeCompare(b.judul);
        if (this.sortBy==='qty') return b.qty - a.qty;
        if (this.sortBy==='harga') return b.harga - a.harga;
        return 0;
      });
      return arr;
    }
  },
  methods: {
    onUPBJJChange() {
      // reset kategori when upbjj changes
      this.filter.kategori = '';
    },
    resetFilters() {
      this.filter = { upbjj:'', kategori:'', presets:'' };
      this.q = '';
      this.sortBy = 'judul';
    },
    editItem(s) {
      this.editing = true;
      this.form = Object.assign({}, s);
    },
    confirmDelete(s) {
      this.toDelete = s;
      this.showConfirm = true;
    },
    deleteItem() {
      if (!this.toDelete) return;
      this.raw = this.raw.filter(r => r.kode !== this.toDelete.kode);
      this.toDelete = null;
      this.showConfirm = false;
    },
    closeModal() {
      this.showAdd = false;
      this.editing = false;
      this.form = {};
    },
    saveForm() {
      // simple validation
      if (!this.form.kode || !this.form.judul) { alert('Kode dan Judul wajib diisi'); return; }
      const exists = this.raw.find(r=>r.kode===this.form.kode);
      if (this.editing) {
        // update
        const idx = this.raw.findIndex(r=>r.kode===this.form.kode);
        if (idx>-1) this.raw.splice(idx,1,this.form);
        this.editing = false;
        showToast("Perubahan data berhasil disimpan!");
      } else {
        if (exists) { alert('Kode sudah ada'); return; }
        this.raw.push(Object.assign({}, this.form));
        this.showAdd = false;
        showToast("Data baru berhasil disimpan!");
      }
      this.form = {};
    }
  },
  filters: {
    currency(val) {
      if (val==null) return '-';
      return 'Rp ' + val.toLocaleString('id-ID');
    },
    withUnit(val) {
      if (val==null) return '-';
      return val + ' buah';
    }
  }
});
