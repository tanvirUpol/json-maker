import { useState } from "react";
import * as XLSX from 'xlsx/xlsx.mjs';
import csvtojson from 'csvtojson';

const JsonConverter = () => {
    
        const [files, setFiles] = useState(null);
        const [jsonFile, setJsonFile] = useState(null);
        const [error, setError] = useState(null);
        const [highlight, setHighlight] = useState(false);
        const [nameToDelete, setNameToDelete] = useState("");

        // Handle drag events
        const handleDragEnter = (event) => {
            event.preventDefault();
            setHighlight(true);
          };
        
          const handleDragOver = (event) => {
            event.preventDefault();
            setHighlight(true);
          };
        
          const handleDragLeave = (event) => {
            event.preventDefault();
            setHighlight(false);
          };
        
          const handleDrop = (event) => {
            event.preventDefault();
            setHighlight(false);
            const newFiles = [...event.dataTransfer.files];
            setFiles(newFiles);
            handleFileUpload(newFiles);
          };


        const handleFileUpload =  (files) => {

        const file = files[0]
        setFiles(files)
        const extension = file.name.split('.').pop().toLowerCase();
        
    
        if (extension === 'csv') {
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = () => {
            csvtojson()
                .fromString(fileReader.result)
                .then((json) => {
                    // setJsonFile(json);
                    const updateData = json.map((data) => {
                        return { ...data, image: "" };
                    });
                    setJsonFile(updateData);
                });
            };
            
        }
        else if (extension === 'xls' || extension === 'xlsx') {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            let json;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            json = XLSX.utils.sheet_to_json(sheet);
            const updateData = json.map((data) => {
                return { ...data, image: "" };
            });
            setJsonFile(updateData);
            }
            
        }
        else {
            console.error('Unsupported file type.');
        }

        
    
        
        };
        
        const removeFile = ()=>{
            setFiles(null)
            setJsonFile(null)
            setError(false)
        }

        const handleSubmit = (event) =>{
            event.preventDefault();

            console.log("Uploaded JSON",jsonFile);
      
        }

        const handleDeleteByName = () => {
            const updatedJson= jsonFile.filter((data) => data.Name !== nameToDelete);
            setJsonFile(updatedJson);
            setNameToDelete("");
          };


  return (
    <div>
            <h1>Drag & Drop Files</h1>

            <form onSubmit={handleSubmit} >
                {files ?
                    <div className="uploadedFile">
                    <h2>{files[0].name}</h2> 
                    <button onClick={removeFile}>Remove</button>
                    
                    </div>  :
                    <label  id="drop-area"
                    className={`file-input-with-drag-and-drop ${highlight ? 'highlight' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    name="fileUp"
                    >
                    <div>Drag and drop files here or click to select files</div>
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        name="fileUp"
                        onChange={(e)=>{handleFileUpload(e.target.files);}}
                        hidden
                    />
                    </label>
                }
                {error && <h3>Wrong file format!!</h3>}
              { jsonFile &&  <input type="submit" className="submit-btn"  value="Submit" />}
            </form>
            
           { jsonFile && <div className="delete-menu" >
                <input
                    type="text"
                    placeholder="Enter name to delete"
                    value={nameToDelete}
                    onChange={(e) => setNameToDelete(e.target.value)}
                />
                <button onClick={handleDeleteByName}>Delete</button>
            </div>
            }   
            

            <pre>{jsonFile && JSON.stringify(jsonFile, null, 4)}</pre>

    </div>
  )
}
export default JsonConverter