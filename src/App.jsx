import { useState } from 'react';
import './App.css'; // 일반 CSS

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [textFileName, setTextFileName] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const apiBaseUrl = "https://fastapi-backend-79a4.onrender.com/api";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택하세요!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      const data = await response.json();
      setText(data.transcribed_text);
      setSummary(data.summarized_text);
      setTextFileName(data.text_file);
    } catch (err) {
      setError(err.message || '업로드 실패');
      setText('');
      setSummary('');
      setTextFileName('');
    }
  };

  const handleQuestion = async () => {
    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

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
      const newChat = data.chat || [];

      setChatHistory(prev => [
        ...prev,
        ...newChat
          .filter(entry => entry.role !== 'mode' && entry.role !== 'meeting_id')
          .map(entry => ({
            role: entry.role === 'assistant' ? 'bot' : entry.role,
            content: entry.content
          }))
      ]);

      setQuestion('');
    } catch (err) {
      console.error("❌ 질문 실패:", err);
      setError(err.message || '질문 실패');
    }
  };

  return (
    <div className="container">
      <h1 className="title">🎧 회의록 변환 & 요약</h1>
      <div className="main">
        <div className="left-panel">
          <h2>📁 파일 업로드</h2>
          <input type="file" accept=".mp3" onChange={handleFileChange} />
          <button onClick={handleUpload}>업로드 및 변환</button>
          {error && <p className="error">⚠️ {error}</p>}

          {text && (
            <>
              <h3>📝 변환된 텍스트</h3>
              <pre className="box">{text}</pre>
            </>
          )}

          {summary && (
            <>
              <h3>📄 요약된 텍스트</h3>
              <pre className="box">{summary}</pre>
            </>
          )}

          {textFileName && (
            <a
              className="download"
              href={`${apiBaseUrl}/download/${textFileName}`}
              download
            >
              변환된 텍스트 다운로드
            </a>
          )}
        </div>

        <div className="right-panel">
          <h2>💬 회의 챗봇</h2>
          <div className="chat-box">
            {chatHistory.map((entry, idx) => (
              <div key={idx} className={`chat ${entry.role}`}>
                <span>{entry.role === 'bot' ? '🤖' : '👤'} {entry.content}</span>
              </div>
            ))}
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
