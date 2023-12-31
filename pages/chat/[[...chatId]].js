import { getSession } from '@auth0/nextjs-auth0'
import { faRobot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChatSidebar } from 'components/ChatSidebar'
import { Message } from 'components/Message'
import clientPromise from 'lib/mongodb'
import { ObjectId } from 'mongodb'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { streamReader } from 'openai-edge-stream'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

export default function ChatPage({ chatId, title, messages = [] }) {
  const router = useRouter()
  const [newChatId, setNewChatId] = useState(null)
  const [incomingMessage, setIncomingMessage] = useState('')
  const [messageText, setMessageText] = useState('')
  const [newChatMessages, setNewChatMessages] = useState([])
  const [fullMessage, setFullMessage] = useState('')
  const [generatingResponse, setGeneratingResponse] = useState(false)
  const [originalChatId, setOriginalChatId] = useState(chatId)
  let routeHasChanged = chatId !== originalChatId
  /** When route changes update updates variables to initial*/
  useEffect(() => {
    setNewChatMessages([])
    setNewChatId(null)
  }, [chatId])
  /** save the newly streamed message to new chat messages */
  useEffect(() => {
    if (!routeHasChanged && !generatingResponse && fullMessage) {
      setNewChatMessages((prev) => [
        ...prev,
        { _id: uuid(), role: 'assistant', content: fullMessage },
      ])
      setFullMessage('')
    }
  }, [routeHasChanged, generatingResponse, fullMessage])

  /** Handle we created a new chat */
  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null)
      router.push(`/chat/${newChatId}`)
    }
  }, [newChatId, generatingResponse])

  /** @summary: For submitting prompt text */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneratingResponse(true)
    setOriginalChatId(chatId)
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuid(),
          role: 'user',
          content: messageText,
        },
      ]
      return newChatMessages
    })
    setMessageText('')

    const response = await fetch(`/api/chat/sendMessage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ chatId, message: messageText }),
    })
    const data = response.body

    if (!data) {
      return
    }

    const reader = data.getReader()
    let content = ''
    await streamReader(reader, (message) => {
      console.log('MESSAGE', message)
      if (message.event === 'newChatId') {
        setNewChatId(message.content)
      } else {
        setIncomingMessage((s) => `${s}${message?.content}`)
        content = content + message.content
      }
    })
    setFullMessage(content)
    setIncomingMessage('')
    setGeneratingResponse(false)
  }
  const allMessages = [...messages, ...newChatMessages]
  return (
    <>
      <Head>
        <title>Chats Page - RoboBH</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} title={title} messages={messages} />
        <div className="flex flex-col overflow-hidden  bg-gray-700">
          <div className="flex flex-1 flex-col-reverse overflow-scroll overflow-x-hidden text-white">
            {!allMessages.length && !incomingMessage && (
              <div className="m-auto items-center justify-center text-center">
                <div>
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-6xl text-emerald-200"
                  />
                  <h1 className="mt-2 text-4xl font-bold text-white/50">
                    Ask me a question!
                  </h1>
                </div>
              </div>
            )}
            {!!allMessages.length && (
              <div className="mb-auto">
                {allMessages?.map((message) => (
                  <Message
                    key={message._id}
                    role={message.role}
                    content={message.content}
                  />
                ))}
                {!!incomingMessage && !routeHasChanged && (
                  <Message role="assistant" content={incomingMessage} />
                )}
                {!!incomingMessage && !!routeHasChanged && (
                  <Message
                    role="notice"
                    content="Only one message at a time. Please allow any other responses to complete another messages"
                  />
                )}
              </div>
            )}
          </div>
          <footer className="bg-gray-800 p-10">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  value={messageText}
                  placeholder={
                    generatingResponse ? 'Responding👨‍💻' : 'Send a message...'
                  }
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key == 'Enter' && e.shiftKey == false) {
                      return handleSubmit(e)
                    }
                  }}
                  className="w-full resize-none rounded-md border-2 border-transparent bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-2 focus:outline-emerald-500"
                />
                <button type="submit" className="btn">
                  Send
                </button>
              </fieldset>
            </form>
          </footer>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async (ctx) => {
  const chatId = ctx.params?.chatId?.[0] || null
  if (chatId) {
    let objectId
    try {
      objectId = new ObjectId(chatId)
    } catch (error) {
      return {
        redirect: {
          destination: '/chat',
        },
      }
    }
    const { user } = await getSession(ctx.req, ctx.res)
    const client = await clientPromise
    const db = client.db('ChattyBh')
    const chat = await db.collection('chats').findOne({
      userId: user.sub,
      _id: objectId,
    })
    if (!chat) {
      return {
        redirect: {
          destination: '/chat',
        },
      }
    }
    const mappedMessages = chat?.messages.map((message) => ({
      ...message,
      _id: uuid(),
    }))
    return {
      props: {
        chatId,
        title: chat?.title,
        messages: mappedMessages,
      },
    }
  }
  return { props: {} }
}
