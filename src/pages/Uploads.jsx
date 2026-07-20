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
      console.log(`📤 Uploading to:/api/upload`);
      console.log(
        `📄 File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      );

      // Use the uploadFile function from upload.js
      const data = await uploadFile(file);

      console.log("✅ File uploaded successfully:", data);

      setUploadStatus({
        success: true,
        message: data.message || "File uploaded successfully!",
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        data: data.data,
      });

      // Reset file input
      setFile(null);
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("❌ Error uploading file:", error);

      // More specific error messages
      if (error.code === "ERR_NETWORK") {
        setError(
          `Cannot connect to server at. Please make sure the backend is running.`,
        );
      } else if (error.response) {
        setError(
          error.response.data.message ||
            `Upload failed: ${error.response.status}`,
        );
      } else if (error.request) {
        setError(
          "No response from server. Please check if backend is running.",
        );
      } else {
        setError(error.message || "Failed to upload file");
      }
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
            ⚠️ {error}
          </div>
        )}

        {uploadStatus && uploadStatus.success && (
          <div className="mt-2 text-green-500 text-sm bg-green-50 p-2 rounded">
            ✓ {uploadStatus.message}
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
            📄 Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        <button
          onClick={handleFileUpload}
          disabled={isLoading || !file}
          className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition-colors ${
            isLoading || !file ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload"
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
