import { UserModel } from '@star-angry/db'
import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import {
  messageEventHandler,
  userEventHandler,
  structureEventHandler,
  gameEventHandler,
  mapEventHandler,
} from './event'

const users: Map<string, Partial<UserModel>> = new Map()

export const createConnection = (io: Server) => {
  io.on('connection', (socket) => {
    const token = socket.handshake.query.token as string
    try {
      const data = (
        jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
      )?.data as Partial<UserModel>
      socket.userId = data.id
      socket.userInfo = data
      users.set(socket.userId!, data)
    } catch (error) {
      socket.send('token error')
      socket.disconnect()
    }

    userEventHandler(socket, io)
    gameEventHandler(socket, io)
    mapEventHandler(socket, io)
    structureEventHandler(socket, io)
    messageEventHandler(socket, io)

    socket.on('disconnect', () => {
      users.delete(socket.userId!)
    })
  })
}
