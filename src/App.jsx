import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [textFileName, setTextFileName] = useState('');

  const apiBaseUrl = "https://fastapi-backend-79a4.onrender.com/api"; // API 기본 경로

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
      setText(data.transcribed_text); // 변환된 원본 텍스트
      setSummary(data.summarized_text); // 요약본
      setTextFileName(data.text_file);
    } catch (err) {
      setError(err.message || '업로드 실패');
      setText('');
      setSummary('');
      setTextFileName('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '30px' }}>🎧 회의록 변환 & 요약</h1>

      <div style={{
        background: '#f9f9f9',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px'
      }}>
        <input 
          type="file" 
          accept=".mp3" 
          onChange={handleFileChange} 
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            width: '100%'
          }}
        />
        <br /><br />
        <button 
          onClick={handleUpload} 
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          업로드 및 변환
        </button>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#ffe6e6',
            border: '1px solid red',
            borderRadius: '8px',
            color: 'red'
          }}>
            <h3>에러 발생:</h3>
            <p>{error}</p>
          </div>
        )}

        {text && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#eef6ff',
            borderRadius: '8px'
          }}>
            <h3>📝 변환된 텍스트:</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
          </div>
        )}

        {summary && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#fff6e6',
            borderRadius: '8px'
          }}>
            <h3>📄 요약된 텍스트:</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
          </div>
        )}

        {textFileName && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a
              href={`${apiBaseUrl}/download/${textFileName}`}
              download
              style={{
                display: 'inline-block',
                marginTop: '10px',
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px'
              }}
            >
              변환된 텍스트 파일 다운로드
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
