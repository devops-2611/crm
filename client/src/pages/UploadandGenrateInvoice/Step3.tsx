import {
  Page,
  Text,
  Document,
  StyleSheet,
  View,
  Image,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";
import moment from "moment";
import useAppBasedContext from "../../hooks/useAppBasedContext";
import { Button, Group, Stack } from "@mantine/core";
import { IconChevronLeft, IconDownload , IconEye, IconRestore } from "@tabler/icons-react";
import { InvoicePreviewProps } from "./Step2";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";

interface DocumentMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

// Registering the font (optional)
// Font.register({
//   family: "Roboto",
//   fonts: [
//     { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf" }, // Regular
//     {
//       src: "https://fonts.gstatic.com/s/roboto/v20/KFOkCnqEu92Fr1Mu72xP.ttf",
//       fontWeight: "bold",
//     }, // Bold
//   ],
// });

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    // fontFamily: 'Roboto',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    marginRight: 30,
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
  centerText: {
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },
  summarySection: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
  },
  summaryRow: {
    display: "flex",
    flexDirection: "row",
    gap: 40,
    justifyContent: "flex-end",
    marginVertical: 5,
    width: "100%",
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tableCell: {
    flex: 3,

    padding: "5",
  },
  tableCellDate: {
    flex: 1,
    textAlign: "center",
  },
  tableCellAmount: {
    flex: 1,
    textAlign: "right",
  },
  BasicInfo: {
    display: "flex",
    justifyContent: "space-between",
  },
  FooterText: {
    position: "absolute", // Fixes the footer position
    bottom: 10, // Distance from the bottom of the page
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  PageNoText: {
    left: 0,
    right: 0,
    fontSize: 10,
    marginTop: 10,
  },
});
const styles_page2 = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 20,
  },
  headerFlexBox: {
    flexDirection: "row-reverse",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logo: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderRight: 1,
    borderBottom: 1,
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    borderStyle: "solid",
    borderLeft: 1,
    borderTop: 1,
    padding: 5,
    fontSize: 10,
    flex: 1,
    textAlign: "left",
  },
  secondlastRowCell: {
    borderStyle: "solid",
    borderTop: 1,
    padding: 5,
    fontSize: 10,
    flex: 1,
    textAlign: "left",
  },
  lastRowCell: {
    borderStyle: "solid",
    borderLeft: 1,
    // borderTop: 1,

    padding: 5,
    fontSize: 10,
    flex: 1,
    textAlign: "left",
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
    fontWeight: "bold",
  },
  summaryTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  accountStateMentTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
  },

  footer: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 10,
  },
  PageNoText: {
    position: "absolute", // Fixes the footer position
    bottom: 10, // Distance from the bottom of the page
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
  },
});
const InvoicePDF = ({ setActiveStep }: InvoicePreviewProps) => {
  const { InvoiceData, customerConfig, setTrackOldFormData , setParsedData, setInvoiceData} = useAppBasedContext();
  const [opened, { toggle }] = useDisclosure();

const logoUrl = `${import.meta.env.VITE_API_BASE_URL}${
    customerConfig?.logoImg
  }`;
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const FinalData = InvoiceData?.invoice;

  const Variables = {
    invoiceId: FinalData?.invoiceId ?? "NA",
    storeName: FinalData?.storeName ?? "NA",
    address: customerConfig?.customerAddress ?? "NA",
    chester: "Dont know mapping key",
    postcode: customerConfig?.customerPost ?? "NA",
    invoiceDate: moment(FinalData?.createdAt).format("Do MMMM YYYY") ?? "NA",
    Period_startDate:
      moment(FinalData?.startDate).format("Do MMMM YYYY") ?? "NA",
    Period_EndDate: moment(FinalData?.endDate).format("Do MMMM YYYY") ?? "NA",
    // Description_Collection_Order
    Description_Collection_Commission_Rate:
      FinalData?.calculationsByOrderType?.COLLECTION?.commissionRate ?? "NA",
    Description_Collection_Commission_Rate_Deliver_Order_value:
      FinalData?.calculationsByOrderType?.COLLECTION?.totalOrderValue.toFixed(
        2
      ) ?? "NA",
    Description_Collection_Commission_VAT: FinalData?.taxRate ?? "NA",
    Description_Collection_Commission_Amount:
      FinalData?.calculationsByOrderType?.COLLECTION?.amount?.toFixed(2) ??
      "NA",
    // Description_Delivery_Order
    Description_Delivery_Commission_Rate:
      FinalData?.calculationsByOrderType?.DELIVERY?.commissionRate ?? "NA",
    Description_Delivery_Commission_Rate_Deliver_Order_value:
      FinalData?.calculationsByOrderType?.DELIVERY?.totalOrderValue.toFixed(
        2
      ) ?? "NA",
    Description_Delivery_Commission_VAT: FinalData?.taxRate ?? "NA",
    Description_Delivery_Commission_Amount:
      FinalData?.calculationsByOrderType?.DELIVERY?.amount?.toFixed(2) ?? "NA",

    // Service Fees section
    Description_ServiceFees_Commission_Rate:
      FinalData?.calculationsByOrderType?.SERVICE_FEE?.commissionRate ?? "NA",
    Description_ServiceFees_TotalOrders:
      FinalData?.calculationsByOrderType?.SERVICE_FEE?.totalOrders ?? "NA",
    Description_ServiceFees_Commission_VAT: FinalData?.taxRate,
    Description_ServiceFees_Amount:
      FinalData?.calculationsByOrderType?.SERVICE_FEE?.amount?.toFixed(2) ??
      "NA",
    // Delivery Fees Section
    Description_DeliveryFees_TotalOrder:
      FinalData?.calculationsByOrderType?.DELIVERY_CHARGE?.totalOrders ?? "NA",
    Description_DeliveryFees_VAT: FinalData?.taxRate ?? "NA",
    Description_DeliveryFees_Amount:
      FinalData?.calculationsByOrderType?.DELIVERY_CHARGE?.amount?.toFixed(2) ??
      "NA",

    // Driver Fees Section
    Description_DriverFees_TotalOrder:
      FinalData?.calculationsByOrderType?.DRIVER_TIP?.totalOrders ?? "NA",
    Description_DriverFees_VAT: FinalData?.taxRate ?? "NA",
    Description_DriverFees_Amount:
      FinalData?.calculationsByOrderType?.DRIVER_TIP?.amount?.toFixed(2) ??
      "NA",

    // TotalSections
    Subtotal: FinalData?.totalSubTotal?.toFixed(2) ?? "NA",
    VAT: FinalData?.tax_amount?.toFixed(2) ?? "NA",
    Total_INC_VAT: FinalData?.totalWithTax?.toFixed(2) ?? "NA",

    //Page 2 SUmmary Section
    summaryTotalDeliveryOrders:
      FinalData?.calculationsByOrderType?.DELIVERY?.totalOrders ?? 0,
    summaryTotalCollectionOrders:
      FinalData?.calculationsByOrderType?.COLLECTION?.totalOrders ?? 0,
    sumarynoOfCardPayments:
      FinalData?.calculationsByPaymentType?.CARD?.totalOrders ?? 0,
    sumarynoOfCashPayments:
      FinalData?.calculationsByPaymentType?.CASH?.totalOrders ?? 0,

    summaryCardTotal:
      FinalData?.calculationsByPaymentType?.CARD?.totalOrderValue?.toFixed(2) ??
      0,
    summaryCashTotal:
      FinalData?.calculationsByPaymentType?.CASH?.totalOrderValue?.toFixed(2) ??
      0,

    summaryTotalSales: FinalData?.totalSalesValue?.toFixed(2) ?? 0,

    summaryAmountTOBepadiAfterDeductions:
      FinalData?.amountToRecieve.total?.toFixed(2) ?? 0,
    summaryAmountTOBeviaBankTransfer:
      FinalData?.amountToRecieve.bankPayment?.toFixed(2) ?? 0,
    summaryAmounttobePAidViaCashOrders:
      FinalData?.amountToRecieve.cashPayment?.toFixed(2) ?? 0,

    //Page 2 Account Section
    AccountBalanceAmount: "TODO AccountBalanceAmount",
  };

  useEffect(() => {
    if (InvoiceData && InvoiceData?.invoice && customerConfig && logoUrl) {
      const generatePDF = async () => {
        // Create the PDF document using @react-pdf/renderer
        const doc = (
          <Document
            // {...metaDataProps}
            onRender={(props) => console.log(props?.blob?.size, "on rendner")}
            key={Variables?.invoiceId}
          >
            {/* Page 1 */}
            <Page size="A4" style={styles.page}>
              {/* Header Section */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.boldText}>
                    Invoice no. {Variables?.invoiceId}
                  </Text>
                  <Text style={styles.boldText}>
                    Invoice date: {Variables?.invoiceDate}
                  </Text>
                </View>
              </View>
              <View style={{ display: "flex", flexDirection: "row-reverse" }}>
                {" "}
                <Image src={logoUrl} style={styles.logo} />
              </View>

              {/* Store and Swishr Details */}
              <View style={styles.tableRow}>
                <View style={styles.section}>
                  <Text>{CustomerVairables?.storeName}</Text>
                  <Text>{CustomerVairables?.addressLine1}</Text>
                  <Text>{CustomerVairables?.addressArea}</Text>

                  <Text>{CustomerVairables?.postcode}</Text>
                </View>
                <View style={styles.section}>
                  <Text>{Variables?.storeName}</Text>
                  <Text>128 City Road</Text>
                  <Text>London</Text>
                  <Text>EC1V 2NX</Text>
                  <Text>VAT Number: 467 7930 40</Text>
                  <Text>Tel: 0207 046 1829</Text>
                  <Text>e-Mail: Restaurants@Swishr.co.uk</Text>
                </View>
              </View>
              {/* Period Section */}
              <View style={styles.section}>
                <Text style={styles.boldText}>Period:</Text>
                <Text>
                  {Variables.Period_startDate} - {Variables?.Period_EndDate}
                </Text>
              </View>

              {/* Description Table */}
              <View>
                <View style={styles.tableHeader}>
                  <Text
                    style={{
                      ...styles.tableCell,
                      ...styles.boldText,
                      fontSize: 13,
                    }}
                  >
                    Description
                  </Text>
                  <Text
                    style={{
                      ...styles.tableCellAmount,
                      ...styles.boldText,
                      fontSize: 13,
                    }}
                  >
                    Amount
                  </Text>
                </View>
                {FinalData?.calculationsByOrderType?.COLLECTION && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {Variables?.Description_Collection_Commission_Rate}%
                      Commission On Collection Order Value £
                      {
                        Variables?.Description_Collection_Commission_Rate_Deliver_Order_value
                      }{" "}
                      (VAT @ {Variables?.Description_Delivery_Commission_VAT}%)
                    </Text>
                    <Text style={styles.tableCellAmount}>
                      £{Variables?.Description_Collection_Commission_Amount}
                    </Text>
                  </View>
                )}
                {FinalData?.calculationsByOrderType?.DELIVERY && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {Variables?.Description_Delivery_Commission_Rate}%
                      Commission On Delivery Order Value £
                      {
                        Variables?.Description_Delivery_Commission_Rate_Deliver_Order_value
                      }{" "}
                      (VAT @ {Variables?.Description_Delivery_Commission_VAT}%)
                    </Text>
                    <Text style={styles.tableCellAmount}>
                      £{Variables?.Description_Delivery_Commission_Amount}
                    </Text>
                  </View>
                )}

                {FinalData?.calculationsByOrderType?.SERVICE_FEE && (
                  <View style={styles.tableRow}>
                    {FinalData?.calculationsByOrderType?.SERVICE_FEE
                      ?.isCashOrders ? (
                      <Text style={styles.tableCell}>
                        Service Fee Paid By Cash Orders (
                        {Variables?.Description_ServiceFees_TotalOrders} Orders)
                        (VAT @ {Variables?.Description_Delivery_Commission_VAT}
                        %)
                      </Text>
                    ) : (
                      <Text style={styles.tableCell}>
                        Service Fees (
                        {Variables?.Description_ServiceFees_TotalOrders} Orders
                        ) (VAT @{" "}
                        {Variables?.Description_Delivery_Commission_VAT}%)
                      </Text>
                    )}

                    <Text style={styles.tableCellAmount}>
                      £{Variables?.Description_ServiceFees_Amount}
                    </Text>
                  </View>
                )}
                {FinalData?.calculationsByOrderType?.DELIVERY_CHARGE && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      Delivery Fees Withheld (
                      {Variables?.Description_DeliveryFees_TotalOrder} Orders)
                      (VAT @ {Variables?.Description_DeliveryFees_VAT}%)
                    </Text>
                    <Text style={styles.tableCellAmount}>
                      £{Variables?.Description_DeliveryFees_Amount}
                    </Text>
                  </View>
                )}

                {FinalData?.calculationsByOrderType?.DRIVER_TIP && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      Driver Tip ({Variables?.Description_DriverFees_TotalOrder}{" "}
                      Orders) (VAT @ {Variables?.Description_DriverFees_VAT}%)
                    </Text>
                    <Text style={styles.tableCellAmount}>
                      £{Variables?.Description_DriverFees_Amount}
                    </Text>
                  </View>
                )}
              </View>

              {/* Totals Section */}
              <View style={{ marginTop: "20px" }}>
                <View style={styles.summaryRow}>
                  <Text style={{ ...styles.boldText, gap: "20px" }}>
                    Sub-Total:
                  </Text>
                  <Text style={styles.boldText}>£{Variables?.Subtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={{ ...styles.boldText }}>VAT:</Text>
                  <Text style={styles.boldText}>£{Variables?.VAT}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.boldText}>Total Inc. VAT:</Text>
                  <Text style={styles.boldText}>
                    £{Variables?.Total_INC_VAT}
                  </Text>
                </View>
              </View>
              <View style={styles.FooterText}>
                <Text>
                  You don’t need to do anything, this will automatically be
                  deducted in your Swishr Account statement 128 City Road,
                  London, EC1V 2NX
                </Text>
                <Text style={styles.PageNoText}>Page 1 of 2</Text>
              </View>
            </Page>

            {/* Page 2 */}
            <Page size="A4" style={styles.page}>
              {/* Header */}
              <View style={styles_page2.headerFlexBox}>
                <View>
                  <Image src={logoUrl} style={styles.logo} />
                  <Text>
                    {Variables.Period_startDate} - {Variables?.Period_EndDate}
                  </Text>
                  {/* <Text>Restaurant ID: TODO</Text>
          <Text>Account Ref: TODO</Text> */}
                </View>
              </View>

              {/* Summary Section */}
              <Text
                style={{ ...styles_page2.summaryTitle, ...styles.boldText }}
              >
                Summary
              </Text>

              {/* Table */}
              <View style={styles_page2.table}>
                <View style={[styles_page2.tableRow, styles_page2.tableHeader]}>
                  <Text
                    style={{ ...styles_page2.tableCell, ...styles.boldText }}
                  >
                    Total Orders
                  </Text>
                  <Text style={styles_page2.tableCell}>
                    {Number(Variables?.summaryTotalDeliveryOrders) +
                      Number(Variables?.summaryTotalCollectionOrders)}
                  </Text>
                </View>
                <View style={styles_page2.tableRow}>
                  <Text style={styles_page2.tableCell}>Delivery Orders</Text>
                  <Text style={styles_page2.tableCell}>
                    {Variables?.summaryTotalDeliveryOrders}
                  </Text>
                </View>
                <View style={styles_page2.tableRow}>
                  <Text style={styles_page2.tableCell}>Collections Orders</Text>
                  <Text style={styles_page2.tableCell}>
                    {Variables?.summaryTotalCollectionOrders}
                  </Text>
                </View>
                <View style={styles_page2.tableRow}>
                  <Text style={styles_page2.tableCell}>
                    {Variables?.sumarynoOfCardPayments} Card Payments
                  </Text>
                  <Text style={styles_page2.tableCell}>
                    £{Variables?.summaryCardTotal}
                  </Text>
                </View>
                <View style={styles_page2.tableRow}>
                  <Text style={styles_page2.tableCell}>
                    {Variables?.sumarynoOfCashPayments} Cash Payments (Including
                    Service Fee)
                  </Text>
                  <Text style={styles_page2.tableCell}>
                    £{Variables?.summaryCashTotal}
                  </Text>
                </View>
                {/* <View style={styles_page2.tableRow}>
            <Text style={styles_page2.tableCell}>Food & Drink Value</Text>
            <Text style={styles_page2.tableCell}>£157.37</Text>
          </View> */}
                <View style={styles_page2.tableRow}>
                  <Text style={styles_page2.tableCell}>Total Sales</Text>
                  <Text style={styles_page2.tableCell}>
                    £{Variables?.summaryTotalSales}
                  </Text>
                </View>
                <View style={styles_page2.tableRow}>
                  <Text style={{ ...styles_page2.lastRowCell, borderTop: 1 }}>
                    Total To Be Paid This Week After All Deductions
                  </Text>
                  <Text
                    style={{ ...styles_page2.secondlastRowCell, borderLeft: 1 }}
                  >
                    £{Variables?.summaryAmountTOBeviaBankTransfer} will be paid
                    via Bank Transfer Payments
                  </Text>
                </View>
                <View style={styles_page2.tableRow}>
                  <Text style={styles_page2.lastRowCell}>
                    £{Variables?.summaryAmountTOBepadiAfterDeductions}
                  </Text>
                  <Text style={{ ...styles_page2.lastRowCell, borderLeft: 1 }}>
                    £{Variables?.summaryAmounttobePAidViaCashOrders} Paid via
                    Cash Order
                  </Text>
                </View>
              </View>
              {/* Account Statement Section */}
              {/* <Text
        style={{ ...styles_page2.accountStateMentTitle, ...styles.boldText }}
      >
        Account Statement
      </Text> */}
              {/* Account Balance */}

              {/* <View style={styles_page2.table}>
        <View style={[styles_page2.tableRow, styles_page2.tableHeader]}>
          <Text style={{ ...styles_page2.tableCell, ...styles.boldText }}>
            Account Balance
          </Text>
          <Text style={styles_page2.tableCell}>TODO £0</Text>
        </View>
      </View>
      <View style={styles_page2.table}>
        <View style={[styles_page2.tableRow, styles_page2.tableHeader]}>
          <Text style={{ ...styles_page2.tableCell, ...styles.boldText }}>
            Date
          </Text>
          <Text style={{ ...styles_page2.tableCell, ...styles.boldText }}>
            Description
          </Text>
          <Text style={{ ...styles_page2.tableCell, ...styles.boldText }}>
            Amount
          </Text>
        </View>
        <View style={styles_page2.tableRow}>
          <Text style={styles_page2.tableCell}> TODO 21st October 2024</Text>
          <Text style={styles_page2.tableCell}>Opening Balance</Text>
          <Text style={styles_page2.tableCell}> TODO £0</Text>
        </View>
        <View style={styles_page2.tableRow}>
          <Text style={styles_page2.tableCell}> TODO 27th October 2024</Text>
          <Text style={styles_page2.tableCell}>
            Card Order Payments Received
          </Text>
          <Text style={styles_page2.tableCell}> TODO £157.37</Text>
        </View>
        <View style={styles_page2.tableRow}>
          <Text style={styles_page2.tableCell}>27th October 2024</Text>
          <Text style={styles_page2.tableCell}>
            {" "}
            TODO Invoice 157 Due TODO
          </Text>
          <Text style={styles_page2.tableCell}> TODO £38.41</Text>
        </View>
        <View style={styles_page2.tableRow}>
          <Text style={styles_page2.tableCell}>TODO 30th October 2024</Text>
          <Text style={styles_page2.tableCell}>
            Remaining Balance Bank Transferred to Merchant
          </Text>
          <Text style={styles_page2.tableCell}>£ TODO</Text>
        </View>
      </View> */}

              {/* Closing Balance */}
              {/* <View style={styles_page2.table}>
        <View style={[styles_page2.tableRow, styles_page2.tableHeader]}>
          <Text style={{ ...styles_page2.tableCell, ...styles.boldText }}>
            Closing Balance
          </Text>
          <Text style={styles_page2.tableCell}>£ TODO</Text>
        </View>
      </View> */}
              {/* Footer Section */}
              <Text style={styles_page2.PageNoText}>Page No 2 of 2</Text>
            </Page>
          </Document>
        );

        // Generate the Blob from the document
        const pdfBlob = await pdf(doc).toBlob();

        // Ensure the Blob is of the correct MIME type (application/pdf)
        const url = URL.createObjectURL(pdfBlob);

        // Set the generated Blob URL
        setPdfUrl(url);
        console.log(url, "url");
      };

      generatePDF();
    } // Generate the PDF on component mount
  }, []);
  if (!InvoiceData?.invoice || !customerConfig) {
    return <div>Data not available</div>;
  }

  if (!logoUrl) {
    return <div>"No logo URL found"</div>;
  }
  console.log(FinalData, "finalData");

  const CustomerVairables = {
    //first page header left side section
    storeName: customerConfig.customerName ?? "NA",
    addressLine1: customerConfig?.customerAddress ?? "NA",
    addressArea: customerConfig?.customerArea ?? "NA",
    postcode: customerConfig?.customerPost ?? "NA",
  };
  const metaDataProps: DocumentMetadata = {
    title: `${Variables?.storeName}_${Variables?.Period_startDate}_ to_${Variables?.Period_EndDate}`,
    author: "John Doe",
    subject: "Sample Document Subject",
    keywords: "sample, document, metaData, pdf",
    creator: "react-pdf",
    producer: "react-pdf",
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${Variables?.storeName}_${Variables?.Period_startDate}_ to_${Variables?.Period_EndDate}`; // Set the filename for the downloaded PDF
      link.click();
    }
  };
  const queryClient = useQueryClient();

const clearCache = useCallback(() => {
  // This will remove the cache for the `parsedData` query
  queryClient.removeQueries({
    queryKey: ["parsedData", "oldFormData", "oldpreviewPDFData","editedAndSavedData"], // Use query key
    exact: true,               // Exact match of the query key
  });
},[queryClient]);
  const handleReset =()=>{
    if(setTrackOldFormData && setParsedData && setInvoiceData){
      setActiveStep(1)
      setTrackOldFormData({step1:undefined, step2:undefined})
      setParsedData(undefined)
      setInvoiceData(undefined)
      clearCache()
    }
  }
  try {
    return (
      <Stack gap={30} mt={30}>
        <Group justify="center" wrap="wrap">
          <Button
            onClick={handleDownload}
            disabled={!pdfUrl}
            leftSection={<IconDownload />}
          >
            Download Invoice
          </Button>
          <Button
            type="button"
            onClick={() => toggle()}
            leftSection={<IconEye />}
            disabled={!pdfUrl}
          >
            Preview
          </Button>
          <Button
            type="button"
            onClick={() => setActiveStep((prev: number) => prev - 1)}
            leftSection={<IconChevronLeft />}
          >
            Go Back
          </Button>
         
          <Button
            type="button"
            onClick={handleReset}
            leftSection={<IconRestore />}
          >
            Reset
          </Button>
        </Group>

        {pdfUrl ? opened && (
          // Embed the Blob URL in the iframe's src
          <iframe
            style={{ width: "100%", height: "100vh", overflow:'scroll' }}
            src={pdfUrl}
            {...metaDataProps}
            title="some"
          />
        ) : (
          <div>Loading PDF...</div>
        )}
      </Stack>
    );
  } catch (error) {
    console.log(error);
    return <div> Check error in console</div>;
  }
};

export default InvoicePDF;
