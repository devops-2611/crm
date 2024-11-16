import { useState } from "react";
import InvoiceStepper from "./InvoiceStepper";
import { Container } from "@mantine/core";
import Demo from "./Step1";
import InvoicePreview from "./Step2";
import MyDocument from "./Step3";

const FormWrapper = () => {
  const [activeStep, setActiveStep] = useState(1);
  
  return (
    <Container>
      <InvoiceStepper active={activeStep} setActiveStep={setActiveStep} />
      {activeStep ===1 && <Demo setActiveStep={setActiveStep}/>}
      {activeStep ===2 && <InvoicePreview setActiveStep={setActiveStep}/>}
      {activeStep ===3 && <MyDocument/>} 

    </Container>
  );
};

export default FormWrapper;
