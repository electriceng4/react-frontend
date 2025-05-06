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
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'bot', content: data.answer }
      ]);
      setQuestion('');
    } catch (err) {
      setError(err.message || '질문 처리 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        🎧 회의록 변환 & 요약
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 왼쪽: 업로드 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">📁 파일 업로드</h2>
          <input
            type="file"
            accept=".mp3"
            onChange={handleFileChange}
            className="block w-full mb-4 border p-2 rounded"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
          >
            업로드 및 변환
          </button>

          {error && <div className="text-red-600 mt-2">⚠️ {error}</div>}

          {text && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">📝 변환된 텍스트</h3>
              <div className="bg-blue-50 p-4 rounded whitespace-pre-wrap text-gray-800 text-sm">
                {text}
              </div>
            </div>
          )}

          {summary && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">📄 요약된 텍스트</h3>
              <div className="bg-yellow-50 p-4 rounded whitespace-pre-wrap text-gray-800 text-sm">
                {summary}
              </div>
            </div>
          )}

          {textFileName && (
            <div className="mt-4">
              <a
                href={`${apiBaseUrl}/download/${textFileName}`}
                download
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                변환된 텍스트 다운로드
              </a>
            </div>
          )}
        </div>

        {/* 오른쪽: 챗봇 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col">
          <h2 className="text-xl font-semibold mb-4">💬 회의 챗봇</h2>

          <div className="flex-1 overflow-y-auto border p-4 rounded bg-gray-50 mb-4 max-h-[400px]">
            {chatHistory.map((entry, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] break-words shadow 
                    ${entry.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-800'}`}
                >
                  {entry.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="예: 오늘 회의 요약해줘"
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              onClick={handleQuestion}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded"
            >
              질문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
