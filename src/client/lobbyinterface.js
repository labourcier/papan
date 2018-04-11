'use strict'

const channel = this.channel

class Lobby extends this.EventEmitter {
  constructor (info, lobbyInterface) {
    super()

    this.info = info
    this.isOwner = lobbyInterface.getUserInfo().id === info.owner.id
  }

  update (info) {
    this.info = info
    this.emit('update', this)
  }

  getInfo () {
    return this.info
  }

  isOwner () {
    return this.isOwner
  }

  setPublic (pub) {
    if (this.isowner) {
      channel.send('PapanLobby.SetLobbyPublic', {
        id: this.info.id,
        public: pub
      })
    }
  }

  setName (name) {
    if (this.isowner) {
      channel.send('PapanLobby.SetLobbyName', {
        id: this.info.id,
        name: name
      })
    }
  }
}

class LobbyInterface extends this.EventEmitter {
  constructor () {
    super()

    this.status = 'UNKNOWN'
    this.lobbyList = {}
    this.publicLobbyList = {}
    channel.send('PapanChannel.GetLobbyConnectionStatus')
    channel.on('PapanLobby.Subscribed', data => {
      this.userInfo = data.self
      this.emit('connected')
    })
    channel.on('PapanLobby.Error', data => {
      this.emit('error', data.message)
    })
    channel.on('PapanChannel.LobbyConnectionStatus', data => {
      this.status = data.status
      this.emit('status', data.status)
    })
    channel.on('PapanLobby.LobbyInfo', data => {
      const id = data.id
      if (this.publicLobbyList[id]) {
        const data = this.publicLobbyList[id]
        delete this.publicLobbyList[id]
        this.emit('publicLobbyRemove', data)
      }
      if (this.lobbyList[id]) {
        this.lobbyList[id].update(data)
      } else {
        this.lobbyList[id] = new Lobby(data, this)
        this.emit('lobbyJoin', this.lobbyList[id])
      }
    })
    channel.on('PapanLobby.PublicLobbyUpdate', data => {
      const id = data.lobby.id
      if (data.status === 'ADDED' && !this.lobbyList[id]) {
        if (this.publicLobbyList[id]) {
          this.emit('publicLobbyUpdate', data.lobby)
        } else {
          this.emit('publicLobbyAdd', data.lobby)
        }
        this.publicLobbyList[id] = data.lobby
      } else {
        this.emit('publicLobbyRemove', data.lobby)
        delete this.publicLobbyList[id]
      }
    })
  }

  getStatus () { return this.status }
  getUserInfo () { return this.userInfo }
  startWatchingLobbies () { channel.send('PapanLobby.StartWatchingLobbies') }
  stopWatchingLobbies () { channel.send('PapanLobby.StopWatchingLobbies') }
  connectToLobbyServer (serverInfo) { channel.send('PapanChannel.ConnectToLobbyServer', serverInfo) }
  createLobby () { channel.send('PapanLobby.JoinLobby') }
  joinLobby (id) { channel.send('PapanLobby.JoinLobby', { id: id }) }
}

this.lobbyInterface = new LobbyInterface()