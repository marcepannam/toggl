import React, { useState, useRef } from "react";

const FilesUploader = (props) => {
  var fileInput = useRef(null);
  var [fileNames, setFileNames] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setStatusMessage("");
    var files = [];
    var len = fileInput.current.files.length;
    for (var file of fileInput.current.files) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        files.push(evt.target.result);
        if (files.length === len) {
          sendFilesToServer(files);
        }
      };
      reader.onerror = function () {
        setStatusMessage(
          <span>Invalid file selected, please open the file again.</span>
        );
      };
      reader.readAsText(file, "UTF-8");
    }
  }

  function getUploadedFileNames() {
    if (!fileInput.current) return [];
    return Array.from(fileInput.current.files).map((file) => file.name);
  }

  async function onResult(rawResponse) {
    if (rawResponse.status === 200) {
      fileInput.current.value = null;
      setFileNames([]);
      setStatusMessage(<div>Sucessfully submitted</div>);
    } else if (rawResponse.status === 500) {
      const content = await rawResponse.json();
      if (content.emails) {
        const emailList = content.emails.map((email, i) => (
          <li key={i}>{email}</li>
        ));
        setStatusMessage(
          <span>
            <span>The submission for above email(s) failed: </span>
            <ul>{emailList}</ul>
          </span>
        );
      } else {
        setStatusMessage(<span>Submission failed, please try again.</span>);
      }
    } else if (rawResponse.status === 422) {
      setStatusMessage(<span>All submitted emails are invalid.</span>);
    } else {
      setStatusMessage(<span>Submission failed, please try again.</span>);
    }
  }

  async function sendDataToServer(data) {
    setLoading(true);
    try {
      const rawResponse = await fetch(
        "https://toggl-hire-frontend-homework.vercel.app/api/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: data,
        }
      );
      onResult(rawResponse);
    } catch (error) {
      setStatusMessage(<span>Submission failed please try again.</span>);
      console.log(error);
    }
    setLoading(false);
  }

  function loadingStatusHtml() {
    if (loading) {
      return (
        <span className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </span>
      );
    } else {
      return "";
    }
  }

  function sendFilesToServer(data) {
    let emails = [];
    for (const file of data) {
      const lines = file.split("\n");
      for (const line of lines) {
        if (line.length > 0) emails.push(line);
      }
    }
    let emailsJSON = JSON.stringify({ emails: emails });
    sendDataToServer(emailsJSON);
  }

  function onFileSelected() {
    setFileNames(getUploadedFileNames());
  }

  return (
    <div className="file-uploader-body">
      <div className="file-uploader">
        <h1 className="title">Upload your list of emails</h1>
        <form onSubmit={onSubmit}>
          <div className="button-wrapper">
            <label className="custom-button" htmlFor="emailFiles">
              Choose files
            </label>
          </div>
          <input
            className="button-input"
            type="file"
            accept=".txt"
            id="emailFiles"
            placeholder="file"
            ref={fileInput}
            onChange={onFileSelected}
            multiple
          />
          <div className="button-wrapper">
            <button type="submit" className="custom-button">
              Submit
            </button>
          </div>
        </form>
        <div className="selected-files-wrapper">
          <p>Selected files...</p>
          <ul>
            {fileNames.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="status-wrapper">
          <span>{loadingStatusHtml(loading)}</span>
          <div className="result-wrapper">{statusMessage}</div>
        </div>
      </div>
    </div>
  );
};

export default FilesUploader;
