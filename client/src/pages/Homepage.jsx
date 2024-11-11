import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";
import { FileUpload } from "../components/FileUpload"

const Homepage = () => {

  const handleChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    console.log(file);
    const resp = await ApiHelpers.POST(ApiConstants.UPLOAD_CSV(), formData);
    console.log("resp", resp);
    
  }

  return (
    <>
    <div>
      invoice - 
      <input type="file" onChange={handleChange}/>
    </div>
    
    <div>This will be the home page</div>
    <FileUpload/>
    </>
  )
}

export default Homepage