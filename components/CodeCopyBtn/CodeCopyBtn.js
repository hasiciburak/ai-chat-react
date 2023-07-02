import { faCopy } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export const CodeCopyBtn = ({ children }) => {

  const handleClick = (e) => {
    navigator.clipboard.writeText(children[0].props.children[0])
    console.log(children)
    // TODO: Add dynamic copy animation here
    // setCopyOk(true)
    // setTimeout(() => {
    //   setCopyOk(false)
    // }, 500)
    alert('Code copied!')
  }

  return (
    <div>
      <button onClick={handleClick} className="copy-btn">
        <span>copy</span>
        <FontAwesomeIcon icon={faCopy} />
      </button>
    </div>
  )
}
