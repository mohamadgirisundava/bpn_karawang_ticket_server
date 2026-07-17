# Dokumentasi Collections — BPN Karawang Ticket Server

Diambil langsung dari schema aktif di `pb_data/data.db` pada 2026-07-16.

---

## `counters` (base)

Master data loket/counter.

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `code` | text | ✅ | Kode counter |
| `name` | text | ✅ | Nama counter |
| `description` | text | ❌ | Deskripsi |
| `color` | text | ❌ | Warna label (untuk UI) |
| `is_priority` | bool | ❌ | Loket prioritas atau bukan |
| `is_active` | bool | ❌ | Aktif/nonaktif |
| `sort_order` | number | ❌ | Urutan tampil |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Rules:**
- List/View: publik (`""`)
- Create/Update/Delete: harus login & `role = "admin"`

---

## `queues` (base)

Antrian tiket yang diambil pengunjung.

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `counter` | relation → `counters` | ✅ | Loket tujuan |
| `queue_number` | number | ✅ | Nomor antrian |
| `queue_code` | text | ✅ | Kode antrian (mis. "A012") |
| `status` | select | ✅ | `waiting`, `called`, `serving`, `completed`, `skipped` |
| `date` | date | ✅ | Tanggal antrian diambil |
| `taken_at` | date | ✅ | Waktu tiket diambil |
| `called_at` | date | ❌ | Waktu dipanggil |
| `completed_at` | date | ❌ | Waktu selesai dilayani |
| `desk_number` | number | ❌ | Nomor loket saat dipanggil |
| `called_by` | relation → `users` | ❌ | Petugas yang memanggil |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Rules:**
- List/View: publik
- Create: publik (siapa saja bisa ambil tiket)
- Update: harus login
- Delete: harus login & `role = "admin"`

---

## `calls` (base)

Riwayat pemanggilan tiket ke suatu loket (log pemanggilan).

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `queue` | relation → `queues` | ✅ | Tiket yang dipanggil |
| `counter` | relation → `counters` | ✅ | Loket yang memanggil |
| `queue_code` | text | ✅ | Kode antrian (denormalized) |
| `counter_name` | text | ❌ | Nama counter (denormalized) |
| `desk_number` | number | ✅ | Nomor loket |
| `is_active` | bool | ❌ | Masih ditampilkan di layar panggilan atau tidak |
| `called_at` | date | ✅ | Waktu panggil |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Rules:**
- List/View: publik (dipakai buat layar display panggilan)
- Create/Update: harus login
- Delete: harus login & `role = "admin"`

---

## `settings` (base)

Key-value config aplikasi.

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `key` | text | ✅ | Nama setting (unique) |
| `value` | text | ✅ | Nilai setting |
| `description` | text | ❌ | Deskripsi |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Index:** unique pada `key`

**Rules:**
- List/View: publik
- Create/Update/Delete: harus login & `role = "admin"`

---

## `users` (auth)

Akun petugas/admin.

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `email` | email | ✅ | Email login |
| `password` | password | ✅ | (hidden, system) |
| `name` | text | ❌ | Nama petugas |
| `avatar` | file | ❌ | Foto profil |
| `role` | select | ✅ | `admin`, `officer` |
| `assigned_counter` | relation → `counters` | ❌ | Loket yang ditugaskan |
| `is_on_duty` | bool | ❌ | Status sedang bertugas (shift berjalan) |
| `is_active` | bool | ❌ | Akun aktif/nonaktif (dikontrol Admin). Nonaktif = tidak bisa login sama sekali. |
| `desk_number` | number | ❌ | Nomor loket petugas |
| `verified` / `emailVisibility` | bool | — | System field auth |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Index:** unique pada `tokenKey`, unique pada `email`

**Rules** (lihat migration `1784209128_updated_users.js` dan `1784209859_updated_users.js`):
- List/View/Update: diri sendiri, **atau** `role = "admin"` (admin bisa kelola akun petugas lain)
- Create: hanya admin yang sudah login (`@request.auth.role = "admin"`) — bukan publik. Superuser pertama dibuat lewat Admin UI (`/_/`), bukan lewat collection ini.
- Delete: hanya admin
- **`authRule`**: `is_active = true` — akun dengan `is_active = false` gagal login walau password benar.

---

## `prayer_schedule` (base)

Jadwal sholat harian, di-sync dari [api.myquran.com](https://api.myquran.com) (sumber Kemenag RI) oleh script `bpn_karawang_display`'s `scripts/sync-prayer-schedule.mjs` — bukan diisi manual. Web Display TV baca collection ini buat jadwal sholat + trigger audio adzan, biar nggak perlu hit API eksternal tiap render (server tetap bisa jalan offline selama datanya sudah pernah di-sync).

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `date` | text | ✅ | Format `YYYY-MM-DD`, unique |
| `imsak` | text | ❌ | Format `HH:mm` |
| `subuh` | text | ✅ | Format `HH:mm` |
| `terbit` | text | ❌ | Format `HH:mm` (bukan waktu sholat, cuma info) |
| `dhuha` | text | ❌ | Format `HH:mm` |
| `dzuhur` | text | ✅ | Format `HH:mm` |
| `ashar` | text | ✅ | Format `HH:mm` |
| `maghrib` | text | ✅ | Format `HH:mm` |
| `isya` | text | ✅ | Format `HH:mm` |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Index:** unique pada `date`

**Rules:**
- List/View: publik (dibaca Display TV tanpa auth)
- Create/Update/Delete: hanya admin (dipakai sync script pakai kredensial admin)

**Catatan:** kalau tanggal hari ini belum ada di collection ini (sync belum pernah jalan / kehabisan data), Display TV otomatis fallback ke perhitungan offline (library `adhan`, sudut Kemenag RI) pakai `settings.sholat_latitude`/`sholat_longitude` — lihat `bpn_karawang_display`'s CLAUDE.md.

---

## `announcements` (base)

Daftar pesan pengumuman terpisah buat running text Display TV — Admin kelola sebagai list (tambah/hapus/urutkan/aktif-nonaktifkan) lewat Aplikasi Loket, bukan satu field teks panjang. Display gabungin semua yang `is_active = true`, urut `sort_order`, jadi satu ticker berjalan.

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `text` | text | ✅ | Isi pesan (maks 500 karakter) |
| `sort_order` | number | ❌ | Urutan tampil di ticker |
| `is_active` | bool | ❌ | Ikut ditampilkan atau tidak |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Rules:**
- List/View: publik (dibaca Display TV tanpa auth)
- Create/Update/Delete: hanya admin

**Catatan:** superseded `settings.display_running_text` (key lama itu sudah dihapus dari daftar field Pengaturan di Aplikasi Loket).

---

## Relasi antar collection

```
counters ──< queues ──< calls
   │                       │
   └───< users (assigned_counter)
                            │
users ──< calls (via counter's queue), called_by (di queues)
```

- `queues.counter` → `counters`
- `queues.called_by` → `users`
- `calls.queue` → `queues`
- `calls.counter` → `counters`
- `users.assigned_counter` → `counters`
