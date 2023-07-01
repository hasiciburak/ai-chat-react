import { useUser } from '@auth0/nextjs-auth0/client'
import { faRobot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React from 'react'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export const Message = ({ role, content }) => {
  const { user } = useUser()
  return (
    <div
      className={`grid grid-cols-[30px_1fr] gap-5 p-5 ${
        role === 'assistant' && 'bg-gray-600'
      }`}
    >
      <div>
        {role === 'user' && (
          <Image
            src={user?.picture}
            width={30}
            height={30}
            alt="User avatar"
            className="rounded-sm shadow-md shadow-black/50"
          />
        )}
        {role === 'assistant' && (
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-sm bg-gray-500 shadow-md shadow-black/50">
            <FontAwesomeIcon icon={faRobot} className="text-emerald-200" />
          </div>
        )}
      </div>
      <div className="prose prose-invert ">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  // eslint-disable-next-line react/no-children-prop
                  children={String(children).replace(/\n$/, '')}
                  language={match[1]}
                  style={materialDark}
                  showInlineLineNumbers={true}
                  wrapLines={true}
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
