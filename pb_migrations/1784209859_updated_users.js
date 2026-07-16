/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field: dipakai Admin buat "Aktif/Nonaktifkan" akun petugas
  // (beda dari is_on_duty yang berarti "lagi shift sekarang").
  collection.fields.add(new Field({
    "hidden": false,
    "id": "bool2318475601",
    "name": "is_active",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // akun nonaktif nggak bisa login sama sekali.
  collection.authRule = "is_active = true"

  app.save(collection)

  // backfill: semua user yang sudah ada dianggap aktif.
  const records = app.findRecordsByFilter("_pb_users_auth_", "id != ''", "", 500, 0)
  for (const record of records) {
    record.set("is_active", true)
    app.save(record)
  }

  return null
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.fields.removeById("bool2318475601")
  collection.authRule = ""

  return app.save(collection)
})
