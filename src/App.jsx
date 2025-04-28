import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [textFileName, setTextFileName] = useState('');

  const apiBaseUrl = "https://fastapi-backend-79a4.onrender.com/api"; // ✅ 추가: API 기본 경로

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
      setText(data.text);
      setTextFileName(data.text_file);
    } catch (err) {
      setError(err.message || '업로드 실패');
      setText('');
      setTextFileName('');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>React + FastAPI 파일 업로드</h1>
      <input type="file" accept=".mp3" onChange={handleFileChange} />
      <br /><br />
      <button onClick={handleUpload}>업로드 및 변환</button>
      <br /><br />
      {text && (
        <div>
          <h3>변환된 텍스트:</h3>
          <p>{text}</p>
        </div>
      )}
      {textFileName && (
        <div style={{ marginTop: '20px' }}>
          <a
            href={`${apiBaseUrl}/download/${textFileName}`} // ✅ 수정: 다운로드 링크도 새 URL로
            download
          >
            변환된 텍스트 파일 다운로드
          </a>
        </div>
      )}
      {error && (
        <div style={{ color: 'red' }}>
          <h3>에러:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;

