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
| `desk_number` | number | ❌ | Nomor meja saat dipanggil |
| `called_by` | relation → `users` | ❌ | Petugas yang memanggil |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Rules:**
- List/View: publik
- Create: publik (siapa saja bisa ambil tiket)
- Update: harus login
- Delete: harus login & `role = "admin"`

---

## `calls` (base)

Riwayat pemanggilan tiket ke suatu loket/meja (log pemanggilan).

| Field | Tipe | Required | Keterangan |
|---|---|---|---|
| `id` | text | ✅ (auto) | ID record |
| `queue` | relation → `queues` | ✅ | Tiket yang dipanggil |
| `counter` | relation → `counters` | ✅ | Loket yang memanggil |
| `queue_code` | text | ✅ | Kode antrian (denormalized) |
| `counter_name` | text | ❌ | Nama counter (denormalized) |
| `desk_number` | number | ✅ | Nomor meja |
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
| `desk_number` | number | ❌ | Nomor meja petugas |
| `verified` / `emailVisibility` | bool | — | System field auth |
| `created` / `updated` | autodate | — | Timestamp otomatis |

**Index:** unique pada `tokenKey`, unique pada `email`

**Rules** (lihat migration `1784209128_updated_users.js` dan `1784209859_updated_users.js`):
- List/View/Update: diri sendiri, **atau** `role = "admin"` (admin bisa kelola akun petugas lain)
- Create: hanya admin yang sudah login (`@request.auth.role = "admin"`) — bukan publik. Superuser pertama dibuat lewat Admin UI (`/_/`), bukan lewat collection ini.
- Delete: hanya admin
- **`authRule`**: `is_active = true` — akun dengan `is_active = false` gagal login walau password benar.

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
