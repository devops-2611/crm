import { useState } from "react";
import InvoiceStepper from "./InvoiceStepper";
import { Container } from "@mantine/core";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

const FormWrapper = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <Container>
      <InvoiceStepper active={activeStep} setActiveStep={setActiveStep} />
      {activeStep === 1 && <Step1 setActiveStep={setActiveStep} />}
      {activeStep === 2 && <Step2 setActiveStep={setActiveStep} />}
      {activeStep === 3 && <Step3 setActiveStep={setActiveStep} />}
    </Container>
  );
};

export default FormWrapper;
