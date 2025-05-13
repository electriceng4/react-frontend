import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [meetingId, setMeetingId] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const apiBaseUrl = "https://fastapi-backend-79a4.onrender.com/api";

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleSaveMeeting = async () => {
    if (!meetingId || !title || !text) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('meeting_id', meetingId);
    formData.append('title', title);
    formData.append('text', text);

    try {
      const response = await fetch(`${apiBaseUrl}/save_meeting`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      const data = await response.json();
      setSummary(data.summary || '');
      setError('');
    } catch (err) {
      setError(err.message || '회의 저장 실패');
      setSummary('');
    }
  };

  const handleQuestion = async () => {
    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    const userMsg = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion('');

    const formData = new FormData();
    formData.append('query', question);

    try {
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      const data = await response.json();
      const chatEntry = (data.chat || []).find(entry => entry.role === 'assistant');
      const fullText = chatEntry?.content || '';

      let index = 0;
      let currentText = '';
      const typingSpeed = 30;

      const interval = setInterval(() => {
        currentText += fullText[index];
        setChatHistory(prev => {
          const newHistory = [...prev];
          const botTyping = { role: 'bot', content: currentText, loading: true };
          if (newHistory.length > 0 && newHistory[newHistory.length - 1].role === 'bot') {
            newHistory[newHistory.length - 1] = botTyping;
          } else {
            newHistory.push(botTyping);
          }
          return newHistory;
        });
        index++;
        if (index >= fullText.length) {
          clearInterval(interval);
          setChatHistory(prev => {
            const newHistory = [...prev];
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1].loading = false;
            }
            return newHistory;
          });
        }
      }, typingSpeed);

    } catch (err) {
      console.error("❌ 질문 실패:", err);
      setError(err.message || '질문 실패');
    }
  };

  return (
    <div className="container">
      <h1 className="title">📝 회의 텍스트 입력 & 요약</h1>
      <div className="main">
        <div className="left-panel">
          <h2>📌 회의 텍스트 입력</h2>
          <input type="text" placeholder="회의 ID" value={meetingId} onChange={e => setMeetingId(e.target.value)} />
          <input type="text" placeholder="제목 (예: 드론 통합 회의)" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea
            placeholder="회의 원문을 여기에 입력하세요..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={10}
            style={{ width: '100%', marginBottom: '12px', padding: '10px', background: '#2a2a2a', color: '#fff', borderRadius: '6px' }}
          />
          <button onClick={handleSaveMeeting}>저장 및 요약 생성</button>
          {error && <p className="error">⚠️ {error}</p>}

          {summary && (
            <>
              <h3>📄 자동 생성된 요약</h3>
              <pre className="box">{summary}</pre>
            </>
          )}
        </div>

        <div className="right-panel">
          <h2>💬 회의 챗봇</h2>
          <div className="chat-box">
            {chatHistory.map((entry, idx) => (
              <div key={idx} className={`chat ${entry.role} ${entry.loading ? 'typing' : ''}`}>
                <span>{entry.role === 'bot' ? '🤖' : '👤'} {entry.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="예: 오늘 회의 요약해줘"
          />
          <button onClick={handleQuestion}>질문하기</button>
        </div>
      </div>
    </div>
  );
}

export default App;