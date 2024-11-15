import ApiHelpers from "../api/ApiHelpers";
import ApiConstants from "../api/ApiConstants";
import { FileUpload } from "../components/FileUpload"
import { PDFViewer } from '@react-pdf/renderer';
import { MyDocument } from "./Mydocument";
const Homepage = () => {

  const handleChange = async(e:any) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("customerId", "101");
    formData.append("taxRate", "20");
    const result = await ApiHelpers.POST(ApiConstants.UPLOAD_CSV(), formData);
  }

  return (
    <>
    Upload: <input type="file" name="file" id="file" onChange={handleChange}/>
    <FileUpload/>
   
    </>
  )
}

export default Homepage