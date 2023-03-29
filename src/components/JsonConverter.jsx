import { useState } from "react";
import * as XLSX from 'xlsx/xlsx.mjs';
import csvtojson from 'csvtojson';

const JsonConverter = () => {
    
        const [files, setFiles] = useState(null);
        const [jsonFile, setJsonFile] = useState(null);
        const [error, setError] = useState(null);
        const [highlight, setHighlight] = useState(false);

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
                        const filteredJson = updateData.filter(data => data.Name);
                        // filter only name and image fields
                        const finalJson = [];
                        for (let i = 0; i < filteredJson.length; i++) {
                            const { Name, image } = filteredJson[i];
                            finalJson.push({ Name, image });
                        }
                        setJsonFile(finalJson);
                        // setJsonFile(filteredJson);
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
                // add image field
                const updateData = json.map((data) => {
                    return { ...data, image: "" };
                });
                // take Name column
                const filteredJson = updateData.filter(data => data.Name);

                // filter only name and image fields
                const finalJson = [];
                for (let i = 0; i < filteredJson.length; i++) {
                    const { Name, image } = filteredJson[i];
                    finalJson.push({ Name, image });
                }
                setJsonFile(finalJson);
                // setJsonFile(updateData);
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

        const handleDeleteByName = (name) => {
            const updatedJson= jsonFile.filter((data) => data.Name !== name);
            setJsonFile(updatedJson);
            // setNameToDelete("");
        };

        const handleImage = (data,name) => {
            console.log(data)
            const formData = new FormData()
            formData.append('image', data)
            const url = `https://api.imgbb.com/1/upload?&key=a756674ea8d16896e53242b8f2d31182`
            fetch(url, {
              method: 'POST',
              body: formData
            })
              .then(response => response.json())
              .then(imageData => {
        
                if (imageData.status === 200) {
                    console.log(imageData.data.url);
                    const updatedJson = [...jsonFile];
                    const objIndex = updatedJson.findIndex(obj => obj.Name === name);
                    updatedJson[objIndex] = { ...updatedJson[objIndex], image: imageData.data.url };
                    setJsonFile(updatedJson);

                }else{
                    console.log(imageData.data.error);
                }
              })
        }

     


  return (
    <div>
            <h1>Drag & Drop Files</h1>

            <form onSubmit={handleSubmit} >
                {files ?
                    <div className="uploadedFile">
                        <h4>{files[0].name}</h4> 
                        <button onClick={removeFile}>Remove</button>
                    </div>  :
                    <label  id="drop-area"
                        className={`file-input-with-drag-and-drop ${highlight ? 'highlight' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        name="fileUp">
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
                { error && <h3>Wrong file format!!</h3> }
                { jsonFile &&  <input type="submit" className="submit-btn"  value="Submit" /> }
            </form>
            
           {/* { jsonFile && 
                <div className="delete-menu" >
                    <input
                        type="text"
                        placeholder="Enter name to delete"
                        value={nameToDelete}
                        onChange={(e) => setNameToDelete(e.target.value)}
                    />
                    <button onClick={handleDeleteByName}>Delete</button>
                </div>
            }    */}
            
            <div className="cards">
                { 
                jsonFile && 
                jsonFile.map(item => (
                    <div className="card"  key={item.Name}>
                        <label name="imageUp">
                            {!item.image && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="icon-image">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>}
                            {item.image && <img className="icon-image" src={item.image} />}
                            <input type="file" id="image" name="imageUp" accept=".jpeg, .png, .svg" onChange={(e)=>handleImage(e.target.files[0],item.Name)} hidden />
                        </label>

                        <h4>{item.Name}</h4>

                        <svg onClick={()=>handleDeleteByName(item.Name)}    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="trash-icon">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" 
                            />
                        </svg>
                    </div>
                ))
                }
            </div>
            {/* <pre>{jsonFile && JSON.stringify(jsonFile, null, 4)}</pre> */}
           

    </div>
  )
}
export default JsonConverter