import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "./App.css";

const defaultTemplate = {
  python: "print('Hello, Python!')",
  javascript: "console.log('Hello, JavaScript!');",
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, C++!" << endl;\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}`
};

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [filesByLanguage, setFilesByLanguage] = useState({
    python: [{ name: "main.py", code: defaultTemplate.python }],
    javascript: [{ name: "main.js", code: defaultTemplate.javascript }],
    cpp: [{ name: "main.cpp", code: defaultTemplate.cpp }],
    java: [{ name: "main.java", code: defaultTemplate.java }],
  });
  const [activeFile, setActiveFile] = useState("main.py");
  const [output, setOutput] = useState("");

  const currentFiles = filesByLanguage[selectedLanguage];
  const activeCode = currentFiles.find((f) => f.name === activeFile)?.code || "";

  useEffect(() => {
    if (currentFiles.length > 0) {
      setActiveFile(currentFiles[0].name);
    }
  }, [selectedLanguage, currentFiles]);

  const updateCode = (newCode) => {
    const updated = currentFiles.map((f) =>
      f.name === activeFile ? { ...f, code: newCode } : f
    );
    setFilesByLanguage({ ...filesByLanguage, [selectedLanguage]: updated });
  };

  const getExt = (lang) => {
    switch (lang) {
      case "python": return "py";
      case "javascript": return "js";
      case "cpp": return "cpp";
      case "java": return "java";
      default: return "txt";
    }
  };

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case "python": return "python";
      case "javascript": return "javascript";
      case "cpp": return "cpp";
      case "java": return "java";
      default: return "plaintext";
    }
  };

  const handleAddFile = () => {
    const ext = getExt(selectedLanguage);
    const name = `${selectedLanguage}_file_${currentFiles.length + 1}.${ext}`;
    const newFiles = [...currentFiles, { name, code: defaultTemplate[selectedLanguage] || "" }];
    setFilesByLanguage({ ...filesByLanguage, [selectedLanguage]: newFiles });
    setActiveFile(name);
  };

  const handleDeleteFile = (name) => {
    const updated = currentFiles.filter((f) => f.name !== name);
    setFilesByLanguage({ ...filesByLanguage, [selectedLanguage]: updated });
    if (activeFile === name && updated.length > 0) {
      setActiveFile(updated[0].name);
    }
  };

 const handleRun = async () => {
  const code = currentFiles.find((f) => f.name === activeFile)?.code || "";

  try {
    const res = await axios.post("https://online-code-editor-backend.onrender.com/run", {
      language: selectedLanguage, // ✅ send "python", not 71
      code,
    });
    setOutput(res.data.output);
  } catch (err) {
    setOutput("Execution error: " + (err.response?.data?.error || err.message));
  }
};


  return (
    <div className="app">
      <div className="header">
        <h1 style={{ marginRight: "2rem" }}>💻 Online Code Editor</h1>
        <div className="language-select">
          <label>Select Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      <div className="main">
        <div className="editor-panel">
          <div className="tabs">
            {currentFiles.map((file) => (
              <div
                key={file.name}
                className={`tab ${activeFile === file.name ? "active" : ""}`}
                onClick={() => setActiveFile(file.name)}
              >
                {file.name}
                <button onClick={() => handleDeleteFile(file.name)}>❌</button>
              </div>
            ))}
            <button className="add-file" onClick={handleAddFile}>➕ Add File</button>
          </div>

          <div className="editor-container">
            <Editor
              height="100%"
              language={getMonacoLanguage(selectedLanguage)}
              theme="vs-dark"
              value={activeCode}
              onChange={updateCode}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 2,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                autoClosingBrackets: 'always',
                formatOnType: true,
              }}
            />
            <button className="run-button" onClick={handleRun}>▶️ Run</button>
          </div>
        </div>

        <div className="output-panel">
          <h3>🖥️ Output</h3>
          <div className="output-box">{output}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
