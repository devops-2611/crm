import{z as B,j as e,l as L,D,r as b,P as k,B as F,G as m,k as T,A as R,M,af as $,ag as V}from"./index-DwXd4TTA.js";import{F as N,h as U,e as _}from"./index.esm-DDE4z3sI.js";import{c as z,d as G,e as v,f as c,h as t,i as H,j as Q,B as g,P as Y,k as w,l as I}from"./MUIThemeProvider-Upu1qkYL.js";import{u as q,L as K}from"./DateTimePicker-Dn1tq8m7.js";import{A as W,a as J}from"./ApiConstants-B3vWYKSo.js";import{S as X,T as n,I as Z}from"./IconTrash-Dnpr9U1C.js";import{T as E}from"./Title-BfubApG4.js";/**
 * @license @tabler/icons-react v3.21.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var ee=B("outline","edit","IconEdit",[["path",{d:"M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1",key:"svg-0"}],["path",{d:"M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z",key:"svg-1"}],["path",{d:"M16 5l3 3",key:"svg-2"}]]);/**
 * @license @tabler/icons-react v3.21.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var re=B("outline","file-download","IconFileDownload",[["path",{d:"M14 3v4a1 1 0 0 0 1 1h4",key:"svg-0"}],["path",{d:"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z",key:"svg-1"}],["path",{d:"M12 17v-6",key:"svg-2"}],["path",{d:"M9.5 14.5l2.5 2.5l2.5 -2.5",key:"svg-3"}]]);const se=z(e.jsx("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"}),"CheckCircle"),ne=({updates:r})=>{const a=J.EDIT_MERCHANT_INVOICE();return W.PUT(a,r)},ie=()=>{const r=L();return q({mutationFn:({updates:a})=>ne({updates:a}),onSuccess:a=>{var s;D.show({title:"Invoice Update",message:((s=a==null?void 0:a.data)==null?void 0:s.message)??"Invoice updated successfully",color:"green",autoClose:2e3,position:"top-center"}),r.invalidateQueries({queryKey:["All_Invoices-Grid-data"]})},onError:a=>{G(a)}})};function le(){var d,u,p,O,P;const{values:r,setFieldValue:a}=_(),s=l=>{var i,o,S,f;a("invoiceParameters",{...r==null?void 0:r.invoiceParameters,calculationsByOrderType:{...(i=r==null?void 0:r.invoiceParameters)==null?void 0:i.calculationsByOrderType,MISCELLANEOUS:((f=(S=(o=r==null?void 0:r.invoiceParameters)==null?void 0:o.calculationsByOrderType)==null?void 0:S.MISCELLANEOUS)==null?void 0:f.filter((ce,A)=>A!==l))??[]}})},j=()=>{var l,i,o;return a("invoiceParameters",{...r==null?void 0:r.invoiceParameters,calculationsByOrderType:{...(l=r==null?void 0:r.invoiceParameters)==null?void 0:l.calculationsByOrderType,MISCELLANEOUS:[...((o=(i=r==null?void 0:r.invoiceParameters)==null?void 0:i.calculationsByOrderType)==null?void 0:o.MISCELLANEOUS)??[],{amount:0,text:""}]}})},{calculationsByOrderType:y,validItem:x}=r.invoiceParameters,h=[...Object.entries(y).map(([l,i])=>{let o=e.jsx(e.Fragment,{});if(l==="COLLECTION")o=e.jsx(m,{children:e.jsx(t,{children:`${i.commissionRate}% Commission on Collection Orders value £${i.totalOrderValue}`})});else if(l==="DELIVERY")o=e.jsxs(m,{children:[e.jsx(t,{children:`${i.commissionRate}% Commission on Delivery Orders value £${i.totalOrderValue}`})," "]});else if(l==="SERVICE_FEE"&&!i.isCashOrders)o=e.jsxs(t,{children:["Service Fee Paid (",i.totalOrders," Orders)"]});else if(l==="SERVICE_FEE"&&i.isCashOrders)o=e.jsxs(t,{children:["Service Fee Paid By Cash Orders (",i.totalOrders," Orders)"]});else if(l==="DELIVERY_CHARGE"&&!i.isCashOrders)o=e.jsxs(t,{children:["Delivery Charge (",i.totalOrders," Orders)"]});else if(l==="DELIVERY_CHARGE"&&i.isCashOrders)o=e.jsxs(t,{children:["Delivery Charge Paid By Cash Orders (",i.totalOrders," Orders)"]});else if(l==="DRIVER_TIP")o=e.jsxs(t,{children:["Driver Tip (",i.totalOrders," Orders)"]});else if(l==="MISCELLANEOUS")return null;return e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:o}),e.jsx(n.Td,{children:e.jsx(c,{name:`invoiceParameters.calculationsByOrderType.${l}.amount`,label:"",extraProps:{prefix:"£",maw:"100px"}})})]},l)}),...(u=(d=r==null?void 0:r.invoiceParameters)==null?void 0:d.calculationsByOrderType)!=null&&u.MISCELLANEOUS&&((P=(O=(p=r==null?void 0:r.invoiceParameters)==null?void 0:p.calculationsByOrderType)==null?void 0:O.MISCELLANEOUS)==null?void 0:P.length)>0?r.invoiceParameters.calculationsByOrderType.MISCELLANEOUS.map((l,i)=>e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsxs(m,{children:[e.jsx(R,{color:"red",variant:"subtle",onClick:o=>s(i),children:e.jsx(Z,{})}),e.jsx(H,{name:`invoiceParameters.calculationsByOrderType.MISCELLANEOUS[${i}].text`,label:""})]})}),e.jsx(n.Td,{children:e.jsx(c,{name:`invoiceParameters.calculationsByOrderType.MISCELLANEOUS[${i}].amount`,label:"",extraProps:{prefix:"£",maw:"100px"}})})]},`MISCELLANEOUS ${i}`)):[],...x.length>0?x.map(l=>e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsxs(t,{children:[" ",`${l.itemName}, ${l.totalQuantity} Qty (Remaining £${l.balanceAmount.toFixed(2)})`]})}),e.jsx(n.Td,{children:e.jsx(c,{name:`invoiceParameters.validItem[${l._id}].deductableAmount`,label:"",extraProps:{prefix:"£",maw:"100px"}})})]},l._id)):[]],C=e.jsxs(n.Tr,{children:[e.jsx(n.Th,{children:"Description"}),e.jsx(n.Th,{children:"Amount"})]});return e.jsxs(Q,{children:[e.jsxs(n,{captionSide:"bottom",withColumnBorders:!0,withRowBorders:!0,withTableBorder:!0,borderColor:"black",mt:20,children:[e.jsx(n.Thead,{children:C}),e.jsx(n.Tbody,{children:h})]}),e.jsx(T,{onClick:()=>j(),mt:10,variant:"outline",children:"Add Row in the table"})]})}function ae(){const r=[e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsx(t,{children:"Total Orders"})}),e.jsx(n.Td,{children:e.jsx(c,{name:"invoiceParameters.totalOrdersCount",label:"",extraProps:{maw:"100px"}})})]},"totalOrdersCount"),e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsx(t,{children:"Delivery Orders"})}),e.jsx(n.Td,{children:e.jsx(c,{name:"invoiceParameters.deliveryOrderCount",label:"",extraProps:{maw:"100px"}})})]},"deliveryOrderCount"),e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsx(t,{children:"Collection Orders"})}),e.jsx(n.Td,{children:e.jsx(c,{name:"invoiceParameters.collectionOrderCount",label:"",extraProps:{maw:"100px"}})})]},"collectionOrderCount"),e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsxs(m,{children:[e.jsx(c,{name:"invoiceParameters.cardPaymentCount",label:"",extraProps:{maw:"100px"}})," ",e.jsx(t,{children:"Card Payments"})]})}),e.jsx(n.Td,{children:e.jsx(c,{name:"invoiceParameters.cardPaymentAmount",label:"",extraProps:{prefix:"£",maw:"100px"}})})]},"cardPaymentAmount"),e.jsxs(n.Tr,{children:[e.jsxs(n.Td,{children:[e.jsxs(m,{children:[e.jsx(c,{name:"invoiceParameters.cashPaymentCount",label:"",extraProps:{maw:"100px"}})," ",e.jsx(t,{children:"Cash Payments (Including Service & Delivery Charges)"})]})," "]}),e.jsx(n.Td,{children:e.jsx(c,{name:"invoiceParameters.cashPaymentAmount",label:"",extraProps:{prefix:"£",maw:"100px"}})})]},"cashPaymentAmount"),e.jsxs(n.Tr,{children:[e.jsx(n.Td,{children:e.jsx(t,{children:"Total Sales"})}),e.jsx(n.Td,{children:e.jsx(c,{name:"invoiceParameters.totalSales",label:"",extraProps:{prefix:"£",maw:"100px"}})})]},"totalSales")];return e.jsxs(e.Fragment,{children:[e.jsx(E,{order:4,mt:20,mb:10,m:"auto",children:"Summary Table"}),e.jsx(n,{withColumnBorders:!0,withRowBorders:!0,withTableBorder:!0,borderColor:"black",children:e.jsx(n.Tbody,{children:r})})]})}const te=r=>{const{closeModal:a,initialValues:s}=r,j=b.useRef(null),{mutateAsync:y,isPending:x,isSuccess:h}=ie(),C=d=>{y({updates:d})};return b.useEffect(()=>{h&&a()},[h]),e.jsxs(k,{p:"xl",shadow:"sm",withBorder:!0,w:"100%",pos:"relative",children:[e.jsx(N,{initialValues:s,onSubmit:C,innerRef:j,children:({values:d,setFieldValue:u})=>e.jsx(U,{children:e.jsxs(X,{w:"100%",children:[e.jsxs(E,{order:5,ta:"center",mb:20,c:"grey",children:["Invoice Id: ",d==null?void 0:d.invoiceId]}),e.jsx(F,{children:e.jsx(v,{name:"invoiceParameters.invoiceDate",label:"Invoice Date"})}),e.jsxs(m,{children:[e.jsx(v,{name:"fromDate",label:"From Date"}),e.jsx(v,{name:"toDate",label:"To Date"})]}),e.jsx(le,{}),e.jsx(ae,{}),e.jsx(E,{order:4,mt:20,mb:10,m:"auto",children:"Account Section"}),e.jsxs(m,{children:[e.jsx(c,{name:"invoiceParameters.openingBalance",label:"Opening Balance",extraProps:{prefix:"£"}}),e.jsx(c,{name:"invoiceParameters.closingBalance",label:"Closing Balance",extraProps:{prefix:"£"}}),e.jsx(c,{name:"invoiceParameters.currentInvoiceCount",label:"Current Invoice Count"})]}),e.jsxs(m,{grow:!0,gap:"md",mt:20,children:[e.jsx(T,{type:"submit",loading:x,children:"Submit"}),e.jsx(T,{type:"reset",variant:"outline",disabled:x,children:"Reset"})]})]})})}),e.jsx(K,{visible:x,zIndex:1e3,overlayProps:{radius:"sm",blur:2}})]})},oe=({label:r,value:a})=>e.jsxs(g,{children:[e.jsx(t,{variant:"body1",sx:{fontWeight:600},children:r}),e.jsx(t,{variant:"body2",color:"textSecondary",children:a})]}),ye=r=>{var d,u;const a=(d=r.row.original)==null?void 0:d.downloadLink,s=(u=r.row.original)==null?void 0:u.invoiceParameters,[j,{open:y,close:x}]=M(!1),{pathname:h}=$(),C=[{label:"Total Sales",value:`£${s==null?void 0:s.totalSales}`},{label:"Total Orders Count",value:s==null?void 0:s.totalOrdersCount},{label:"Delivery Orders",value:s==null?void 0:s.deliveryOrderCount},{label:"Collection Orders",value:s==null?void 0:s.collectionOrderCount},{label:`Card Payments (${s==null?void 0:s.cardPaymentCount}) `,value:`£${s==null?void 0:s.cardPaymentAmount}`},{label:`Cash Payments (${s==null?void 0:s.cashPaymentCount})`,value:`£${s==null?void 0:s.cashPaymentAmount}`},{label:"Delivery Order Value",value:`£${s==null?void 0:s.deliveryOrderValue}`},{label:"Collection Order Value",value:`£${s==null?void 0:s.collectionOrderValue}`}];return e.jsxs(e.Fragment,{children:[e.jsx(g,{sx:{padding:1},children:e.jsxs(Y,{elevation:2,sx:{padding:2},children:[e.jsxs(t,{variant:"h6",sx:{marginBottom:2,display:"flex",alignItems:"center"},children:[e.jsx(se,{sx:{marginRight:1},color:"primary"}),"Invoice Summary"]}),e.jsx(w,{sx:{marginBottom:2}}),e.jsx(g,{sx:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px, 1fr))",gap:2,marginBottom:2},children:C.map(p=>e.jsx(oe,{label:p.label,value:p.value},p.label))}),e.jsx(w,{sx:{marginTop:2}}),e.jsxs(m,{mt:20,align:"flex-end",children:[a&&e.jsx(I,{variant:"contained",color:"primary",href:a,target:"_blank",rel:"noopener noreferrer",sx:{marginTop:1},startIcon:e.jsx(re,{}),children:"Download Invoice"}),(h==null?void 0:h.includes("accounting/invoices"))&&e.jsx(I,{variant:"outlined",color:"primary",onClick:()=>y(),sx:{marginTop:1},startIcon:e.jsx(ee,{}),children:"EDIT INVOICE"})]})]})}),e.jsx(V,{opened:j,onClose:x,title:"",fullScreen:!0,radius:10,closeButtonProps:{iconSize:"lg"},transitionProps:{transition:"fade",duration:200},children:e.jsx(te,{initialValues:r.row.original,closeModal:x})})]})};export{ye as I,ie as u};
