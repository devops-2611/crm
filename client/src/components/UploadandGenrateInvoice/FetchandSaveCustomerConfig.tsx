import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { useGetCustomerConfigbyID } from '../../hooks/useGetCustomerConfigbyID';
import useAppBasedContext from '../../hooks/useAppBasedContext';
import { FormValueTypes } from './Step1';

const FetchandSaveCustomerConfig = () => {
 const  {values}= useFormikContext<FormValueTypes>()
 const { setCustomerConfig } = useAppBasedContext();
 const { data, isSuccess: isSuccessinFetchingCustomerConfig } =
   useGetCustomerConfigbyID(values.customerid ??'');
   useEffect(()=>{
    if(isSuccessinFetchingCustomerConfig){
      setCustomerConfig(data?.data)
    }
   },[data, isSuccessinFetchingCustomerConfig, setCustomerConfig])
   return null
}

export default FetchandSaveCustomerConfig