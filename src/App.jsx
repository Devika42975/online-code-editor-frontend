import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import "./App.css";

const BASE_URL =  "https://online-code-editor-backend-new.onrender.com";


function App() {
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [filesByLanguage, setFilesByLanguage] = useState({
    python: [{ name: "main.py", code: "print('Hello, Python!')" }],
    javascript: [{ name: "main.js", code: "console.log('Hello, JavaScript!');" }],
    cpp: [{ name: "main.cpp", code: "#include<iostream>\nint main() { std::cout << \"Hello, C++!\"; return 0; }" }],
    java: [{ name: "Main.java", code: "public class Main { public static void main(String[] args) { System.out.println(\"Hello, Java!\"); } }" }],
  });
  const [activeFile, setActiveFile] = useState("main.py");
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);

  const currentFiles = filesByLanguage[selectedLanguage];
  const activeCode = currentFiles.find((f) => f.name === activeFile)?.code || "";

  useEffect(() => {
    if (currentFiles.length > 0) {
      setActiveFile(currentFiles[0].name);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const handleResize = () => {
      editorRef.current?.layout();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateCode = (newCode) => {
    const updated = currentFiles.map((f) =>
      f.name === activeFile ? { ...f, code: newCode } : f
    );
    setFilesByLanguage({ ...filesByLanguage, [selectedLanguage]: updated });
  };

  const handleAddFile = () => {
    const ext = getExt(selectedLanguage);
    const name = `${selectedLanguage}_file_${currentFiles.length + 1}.${ext}`;
    const newFiles = [...currentFiles, { name, code: "" }];
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
    setOutput("⏳ Running...");

    try {
      const res = await axios.post(`${BASE_URL}/run`, {
        language: selectedLanguage,
        code,
      });
      setOutput(res.data.output);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Unknown Error";
      setOutput("❌ Execution error: " + errorMessage);
    }
  };

  const getExt = (lang) => {
    switch (lang) {
      case "python":
        return "py";
      case "javascript":
        return "js";
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      default:
        return "txt";
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    setTimeout(() => editor.layout(), 100); // ensure proper layout after mount
  };

  return (
    <div className="app">
      <div className="header">
        <h1>💻 Online Code Editor</h1>
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
            <button className="add-file" onClick={handleAddFile}>
              ➕ Add File
            </button>
          </div>

          <div className="editor-container">
            <Editor
              height="100%"
              language={selectedLanguage}
              theme="vs-dark"
              value={activeCode}
              onChange={updateCode}
              onMount={handleEditorMount}
              defaultValue="// Write your code here"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
            <button className="run-button" onClick={handleRun}>
              ▶️ Run
            </button>
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
