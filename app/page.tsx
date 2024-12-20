// @ts-nocheck
'use client';

import {
  useEffect,
  useState,
  useContext,
  createContext,
  default as React,
} from 'react';
import ReactDOM from 'react-dom';
import dynamic from 'next/dynamic';

const WebChatContext = createContext({});

const WebChatProvider = dynamic(
  async () => {
    // WebChat gets access to the exact React and ReactDOM through window if provided
    // otherwise it uses the bundled-in React version
    window.React = React;
    window.ReactDOM = ReactDOM;
    const WebChat = await import('botframework-webchat');
    return function WebChatProvider(props) {
      return <WebChatContext.Provider value={WebChat} {...props} />;
    };
  },
  { ssr: false, suspense: true }
);

function DigitalAssistantPageInner() {
  const { createDirectLine, default: ReactWebChat } =
    useContext(WebChatContext);
  const [directLineToken, setDirectLineToken] = useState('');
  useEffect(() => {
    if (createDirectLine && directLineToken === '') {
      Promise.resolve().then((res: any) => {
        setDirectLineToken(
          createDirectLine({
            token: '123',
          })
        );
      });
    }
  }, [directLineToken, createDirectLine]);

  if (directLineToken == '') {
    return <>Fetching Token...</>;
  }
  return <ReactWebChat directLine={directLineToken} />;
}

export default function DigitalAssistantPage(props) {
  return (
    <WebChatProvider>
      <DigitalAssistantPageInner {...props} />
    </WebChatProvider>
  );
}
