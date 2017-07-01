'use strict'

const MongoClient = require('mongodb').MongoClient

class MongoCollectionAdaptor {
  constructor (db, collection) {
    this.collection = collection
  }

  put (doc) {
    return this.collection.insertOne(doc)
  }

  get (key) {
    let cursor = this.collection.find({'_id': key})
    return new Promise((resolve, reject) => {
      cursor.each(function (err, doc) {
        if (err === null) {
          resolve(doc)
        } else {
          reject(err)
        }
      })
    })
  }

  update (doc) {
    return this.collection.findOneAndReplace({'_id': doc._id}, doc)
  }
}

class MongoAdaptor {
  table (name) {
    let collection = this.db.collection(name)
    return new MongoCollectionAdaptor(collection)
  }

  connect (url = 'mongodb://localhost/') {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, (err, db) => {
        if (err === null) {
          this.db = db
          resolve(this)
        } else {
          reject(err)
        }
      })
    })
  }
}

exports.create = () => {
  console.log('Using MongoDB adaptor')
  return new MongoAdaptor()
}
