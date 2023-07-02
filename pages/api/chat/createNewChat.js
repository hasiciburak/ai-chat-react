import { getSession } from '@auth0/nextjs-auth0'
import clientPromise from 'lib/mongodb'

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res)
    const { message } = req.body
    const newUserMessage = {
      role: 'user',
      content: message,
    }
    const client = await clientPromise
    const db = client.db('ChattyBh')
    const chat = await db
      .collection('chats')
      .insertOne({
        userId: user.sub,
        messages: [newUserMessage],
        title: message,
      })
      .json({
        _id: chat.insertedId.toString,
        messages: [newUserMessage],
        title: message,
      })
    res.status(200)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'An error occured when creating a new chat' })
    console.log('ERROR OCCURED CREATING NEW CHAT', e)
  }
}
