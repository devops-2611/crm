import { Stepper } from "@mantine/core";
interface InvoiceStepperTypes{
    active:number,
    setActiveStep:(step:number)=>void
}
const InvoiceStepper = (props:InvoiceStepperTypes) => {
    const {active, setActiveStep}=props
  return (
    <Stepper active={active}>
      <Stepper.Step label="Step 1" description="Upload CSV..." />
      <Stepper.Step
        label="Step 2"
        description="Verify Details"
        // color="red"
        // completedIcon={
        //   <IconCircleX style={{ width: rem(20), height: rem(20) }} />
        // }
      />
      <Stepper.Step label="Step 3" description="Preview and Downlaod" />
    </Stepper>
  );
};

export default InvoiceStepper;