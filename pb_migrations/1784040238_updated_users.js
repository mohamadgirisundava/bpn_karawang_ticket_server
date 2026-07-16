/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "select1466534506",
    "maxSelect": 0,
    "name": "role",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "admin",
      "officer"
    ]
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_90131592",
    "help": "",
    "hidden": false,
    "id": "relation3417976055",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "assigned_counter",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "help": "",
    "hidden": false,
    "id": "bool4209503247",
    "name": "is_on_duty",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "help": "",
    "hidden": false,
    "id": "number170196790",
    "max": null,
    "min": null,
    "name": "desk_number",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select1466534506")

  // remove field
  collection.fields.removeById("relation3417976055")

  // remove field
  collection.fields.removeById("bool4209503247")

  // remove field
  collection.fields.removeById("number170196790")

  return app.save(collection)
})
