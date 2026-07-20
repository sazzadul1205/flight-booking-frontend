import { useState } from "react";
import { uploadFile } from "../api/upload";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadStatus(null);
      console.log("File selected:", selectedFile.name);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadStatus(null);

    try {
      const data = await uploadFile(file);

      setUploadStatus({
        success: true,
        message: data.message || "File uploaded successfully!",
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        data: data.data,
      });

      setFile(null);
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-bold">UPLOADS</h3>
        <p className="text-gray-600">Upload your files here.</p>
        <input
          id="file-input"
          type="file"
          className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {error && (
          <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {uploadStatus && uploadStatus.success && (
          <div className="mt-2 text-green-500 text-sm bg-green-50 p-2 rounded">
            {uploadStatus.message}
            <div className="text-xs text-gray-500 mt-1">
              {uploadStatus.fileName} ({uploadStatus.fileSize})
            </div>
            {uploadStatus.data && (
              <div className="text-xs text-gray-400 mt-1">
                Saved as: {uploadStatus.data.filename}
              </div>
            )}
          </div>
        )}

        {file && !uploadStatus?.success && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            📄 Selected: {file.name} ({file.size.toFixed(2)} KB)
          </div>
        )}

        <button
          onClick={handleFileUpload}
          disabled={isLoading || !file}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition-colors`}
        >
          {isLoading ? "Uploading ..." : " Upload File"}
        </button>
      </div>
    </div>
  );
};

export default Upload;
