import {
  Page,
  Text,
  Document,
  StyleSheet,
  View,
  PDFViewer,
} from "@react-pdf/renderer";
import { useQueryClient } from "@tanstack/react-query";
import { Invoice } from "../../hooks/useSaveSubmittedData";
import moment from "moment";
import useAppBasedContext from "../../hooks/useAppBasedContext";
// Registering the font (optional)
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf' }, // Regular
//     { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOkCnqEu92Fr1Mu72xP.ttf', fontWeight: 'bold' }, // Bold
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
    width: 60,
    height: 60,
  },
  boldText: {
    fontWeight: "bold",
  },
  centerText: {
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  summarySection: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
  },
  summaryRow: {
    display:"flex",
    flexDirection: "row",
    gap: 40,
    justifyContent: "flex-end",
    marginVertical: 5,
    width:"100%",
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
    marginBottom: 5,
  },
  tableCell: {
    flex: 3,
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
    display: "flex",
    justifyContent: "center",
  },
});

const InvoicePDF = () => {
  const queryClient = useQueryClient();
  const {trackOldFormData}=useAppBasedContext()

  const { customerConfig } = useAppBasedContext();
const FinalData = trackOldFormData?.step2?.invoice
const VATFromStep1 = trackOldFormData?.step1?.taxrate
console.log(VATFromStep1,"VATFromStep1")
  const Variables = {
    invoiceId: FinalData?.invoiceId,
    storeName: FinalData?.storeName,
    address: customerConfig.customerAddress,
    chester: "Dont know mapping key",
    postcode: "Dont know mapping key",
    invoiceDate: moment(FinalData?.createdAt).format("Do MMMM YYYY"),
    Period_startDate: moment(FinalData?.startDate).format("Do MMMM YYYY"),
    Period_EndDate: moment(FinalData?.endDate).format("Do MMMM YYYY"),
    // Description_Collection_Order
    Description_Collection_Commission_Rate:
      FinalData?.calculationsByOrderType?.COLLECTION?.commissionRate,
    Description_Collection_Commission_Rate_Deliver_Order_value:
      FinalData?.calculationsByOrderType?.COLLECTION?.totalOrderValue.toFixed(2),
    Description_Collection_Commission_VAT: VATFromStep1,
    Description_Collection_Commission_Amount:
      FinalData?.calculationsByOrderType?.COLLECTION?.amount?.toFixed(2),
    // Description_Delivery_Order
    Description_Delivery_Commission_Rate:
      FinalData?.calculationsByOrderType?.DELIVERY?.commissionRate,
    Description_Delivery_Commission_Rate_Deliver_Order_value:
      FinalData?.calculationsByOrderType?.DELIVERY?.totalOrderValue.toFixed(2),
    Description_Delivery_Commission_VAT: VATFromStep1,
    Description_Delivery_Commission_Amount:
      FinalData?.calculationsByOrderType?.DELIVERY?.amount?.toFixed(2),

    // Service Fees section
    Description_ServiceFees_Commission_Rate:
      FinalData?.calculationsByOrderType?.SERVICE_FEE?.commissionRate,
    Description_ServiceFees_TotalOrders:
      FinalData?.calculationsByOrderType?.SERVICE_FEE?.totalOrders,
    Description_ServiceFees_Commission_VAT: VATFromStep1,
    Description_ServiceFees_Amount:
      FinalData?.calculationsByOrderType?.SERVICE_FEE?.amount?.toFixed(2),
    // Delivery Fees Section
    Description_DeliveryFees_TotalOrder:
      FinalData?.calculationsByOrderType?.DELIVERY_CHARGE?.totalOrders,
    Description_DeliveryFees_VAT: VATFromStep1,
    Description_DeliveryFees_Amount:
      FinalData?.calculationsByOrderType?.DELIVERY_CHARGE?.amount?.toFixed(2),

    // Driver Fees Section
    Description_DriverFees_TotalOrder:
      FinalData?.calculationsByOrderType?.DRIVER_TIP?.totalOrders,
    Description_DriverFees_VAT: VATFromStep1,
    Description_DriverFees_Amount:
      FinalData?.calculationsByOrderType?.DRIVER_TIP?.amount?.toFixed(2),

    // TotalSections
    Subtotal: FinalData?.totalSubTotal?.toFixed(2),
    VAT: FinalData?.tax_amount?.toFixed(2),
    Total_INC_VAT: FinalData?.totalWithTax?.toFixed(2),
  };
  console.log(FinalData, "FinalData");
  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        {/* Page 1 */}
        <Page size="A4" style={styles.page}>
          {/* Header Section */}
          <View style={styles.header}>
            {/* <Image
            src="https://i.imgur.com/6oyvQbQ.png" // Replace this with your logo URL
            style={styles.logo}
          /> */}
            <View>
              <Text style={styles.boldText}>
                Invoice no. {Variables?.invoiceId}
              </Text>
              <Text>Invoice date: {Variables?.invoiceDate}</Text>
            </View>
          </View>

          {/* Store and Swishr Details */}
          <View style={styles.tableRow}>
            <View style={styles.section}>
              <Text style={styles.boldText}>Store</Text>
              <Text>Address</Text>
              <Text>Chester</Text>
              <Text>Post code</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.boldText}>{Variables?.storeName}</Text>
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
              <Text style={{ ...styles.tableCell, fontWeight: "bold" }}>
                Description
              </Text>
              <Text style={{ ...styles.tableCellAmount, fontWeight: "bold" }}>
                Amount
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {Variables?.Description_Collection_Commission_Rate}% Commission
                On Collection Order Value £
                {
                  Variables?.Description_Collection_Commission_Rate_Deliver_Order_value
                }{" "}
                (VAT @ {Variables?.Description_Delivery_Commission_VAT}%)
              </Text>
              <Text style={styles.tableCellAmount}>
                £{Variables?.Description_Collection_Commission_Amount}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {Variables?.Description_Delivery_Commission_Rate}% Commission On
                Delivery Order Value £
                {
                  Variables?.Description_Delivery_Commission_Rate_Deliver_Order_value
                }{" "}
                (VAT @ {Variables?.Description_Delivery_Commission_VAT}%)
              </Text>
              <Text style={styles.tableCellAmount}>
                £{Variables?.Description_Delivery_Commission_Amount}
              </Text>
            </View>

            {FinalData?.calculationsByOrderType?.SERVICE_FEE && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  Service Fees ({Variables?.Description_ServiceFees_TotalOrders} Orders
                  ) (VAT @ {Variables?.Description_Delivery_Commission_VAT}%)
                </Text>
                <Text style={styles.tableCellAmount}>
                  £{Variables?.Description_ServiceFees_Amount}
                </Text>
              </View>
            )}
            {FinalData?.calculationsByOrderType?.DELIVERY_CHARGE && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  Delivery Fees Withheld (
                  {Variables?.Description_DeliveryFees_TotalOrder} Orders) (VAT @{" "}
                  {Variables?.Description_DeliveryFees_VAT}%)
                </Text>
                <Text style={styles.tableCellAmount}>
                  £{Variables?.Description_DeliveryFees_Amount}
                </Text>
              </View>
            )}

            {FinalData?.calculationsByOrderType?.DRIVER_TIP && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  Driver Tip
                  ({Variables?.Description_DriverFees_TotalOrder} Orders)  (VAT @{" "}
                  {Variables?.Description_DriverFees_VAT}%)
                </Text>
                <Text style={styles.tableCellAmount}>
                  £{Variables?.Description_DriverFees_Amount}
                </Text>
              </View>
            )}
          </View>

          {/* Totals Section */}
          <View style={{marginTop:"20px"}}>
            <View style={styles.summaryRow}>
              <Text style={{...styles.boldText, gap:"20px"}}>Sub-Total:</Text>
              <Text style={styles.boldText}>£{Variables?.Subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>VAT:</Text>
              <Text>£{Variables?.VAT}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.boldText}>Total Inc. VAT:</Text>
              <Text style={styles.boldText}>£{Variables?.Total_INC_VAT}</Text>
            </View>
          </View>
          <View style={styles.FooterText}>
            You don’t need to do anything, this will automatically be deducted
            in your Swishr Account statement 128 City Road, London, EC1V 2NX
          </View>
          <View style={styles.FooterText}>Page 1 of 2</View>
        </Page>

        {/* Page 2 */}
        <Page size="A4" style={styles.page}>
          {/* Header Section */}
          <View style={styles.header}>
            {/* <Image
            src="https://i.imgur.com/6oyvQbQ.png" // Replace this with your logo URL
            style={styles.logo}
          /> */}
          </View>

          {/* Period Section */}
          <Text style={styles.centerText}>
            Period: 23rd September 2024 - 29th September 2024
          </Text>
          <Text style={styles.centerText}>
            Restaurant ID: 5205 | Account Ref: SWSH-230324-0003
          </Text>

          {/* Summary Section */}
          <View style={styles.summarySection}>
            <Text style={styles.boldText}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text>Total Orders</Text>
              <Text>2</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>1 Delivery Order</Text>
              <Text>1 Collection Order</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Total Sales Inc. Fees</Text>
              <Text>£51.83</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Total Paid By Swishr</Text>
              <Text>£36.06</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Paid Weekly</Text>
              <Text>£36.06 Via Bank Transfer</Text>
            </View>
          </View>

          {/* Account Statement Section */}
          <Text style={[styles.boldText, { marginTop: 20 }]}>
            Account Statement
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Description</Text>
              <Text style={styles.tableCellDate}>Date</Text>
              <Text style={styles.tableCellAmount}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                (23rd September 24 - 29th September 24)
              </Text>
              <Text style={styles.tableCellDate}>—</Text>
              <Text style={styles.tableCellAmount}>—</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>
                Swishr Paid Sales By Bank Transfer
              </Text>
              <Text style={styles.tableCellDate}>02/10/24</Text>
              <Text style={styles.tableCellAmount}>£36.06</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default InvoicePDF;
