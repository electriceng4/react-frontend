import { useState } from 'react';

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
      setChatHistory((prev) => [...prev, { role: 'user', content: question }, { role: 'bot', content: data.answer }]);
      setQuestion('');
    } catch (err) {
      setError(err.message || '질문 처리 실패');
    }
  };

  return (
    <div style={{
      display: 'flex',
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f2f4f8',
      minHeight: '100vh',
      gap: '30px'
    }}>
      {/* 좌측: 파일 업로드 및 요약 */}
      <div style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2>🎧 회의록 변환 및 요약</h2>
        <input type="file" accept=".mp3" onChange={handleFileChange} style={{ margin: '10px 0', width: '100%' }} />
        <button onClick={handleUpload} style={{ backgroundColor: '#1976d2', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none' }}>업로드 및 변환</button>

        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

        {text && (
          <div style={{ marginTop: '20px' }}>
            <h4>📄 변환된 텍스트</h4>
            <div style={{ backgroundColor: '#eef6ff', padding: '10px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>{text}</div>
          </div>
        )}

        {summary && (
          <div style={{ marginTop: '20px' }}>
            <h4>📝 요약된 텍스트</h4>
            <div style={{ backgroundColor: '#fff6e6', padding: '10px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>{summary}</div>
          </div>
        )}

        {textFileName && (
          <div style={{ marginTop: '20px' }}>
            <a href={`${apiBaseUrl}/download/${textFileName}`} download style={{ textDecoration: 'none', color: 'white', backgroundColor: '#43a047', padding: '10px 20px', borderRadius: '6px' }}>
              변환된 텍스트 다운로드
            </a>
          </div>
        )}
      </div>

      {/* 우측: 질문 챗봇 */}
      <div style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2>💬 회의 챗봇</h2>
        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
          {chatHistory.map((entry, idx) => (
            <div key={idx} style={{
              textAlign: entry.role === 'user' ? 'right' : 'left',
              marginBottom: '10px'
            }}>
              <div style={{
                display: 'inline-block',
                backgroundColor: entry.role === 'user' ? '#c5e1a5' : '#e3f2fd',
                padding: '10px',
                borderRadius: '10px',
                maxWidth: '80%'
              }}>
                {entry.content}
              </div>
            </div>
          ))}
        </div>

        <input
          type="text"
          placeholder="예: 오늘 회의 요약해줘"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '10px'
          }}
        />
        <button onClick={handleQuestion} style={{
          backgroundColor: '#673ab7',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '6px',
          border: 'none'
        }}>
          질문하기
        </button>
      </div>
    </div>
  );
}

export default App;
