import{f as A,u as R,c as w,a as I,j as e,B as N,ab as S,g as k,s as z}from"./index-DwXd4TTA.js";var x={root:"m_66836ed3",wrapper:"m_a5d60502",body:"m_667c2793",title:"m_6a03f287",label:"m_698f4f23",icon:"m_667f2a6a",message:"m_7fa78076",closeButton:"m_87f54839"};const P={},$=k((t,{radius:l,color:o,variant:a,autoContrast:i})=>{const r=t.variantColorResolver({color:o||t.primaryColor,theme:t,variant:a||"light",autoContrast:i});return{root:{"--alert-radius":l===void 0?void 0:z(l),"--alert-bg":o||a?r.background:void 0,"--alert-color":r.color,"--alert-bd":o||a?r.border:void 0}}}),f=A((t,l)=>{const o=R("Alert",P,t),{classNames:a,className:i,style:r,styles:j,unstyled:v,vars:h,radius:E,color:L,title:d,children:u,id:g,icon:b,withCloseButton:m,onClose:_,closeButtonLabel:B,variant:n,autoContrast:V,...C}=o,s=w({name:"Alert",classes:x,props:o,className:i,style:r,classNames:a,styles:j,unstyled:v,vars:h,varsResolver:$}),c=I(g),p=d&&`${c}-title`||void 0,y=`${c}-body`;return e.jsx(N,{id:c,...s("root",{variant:n}),variant:n,ref:l,...C,role:"alert","aria-describedby":y,"aria-labelledby":p,children:e.jsxs("div",{...s("wrapper"),children:[b&&e.jsx("div",{...s("icon"),children:b}),e.jsxs("div",{...s("body"),children:[d&&e.jsx("div",{...s("title"),"data-with-close-button":m||void 0,children:e.jsx("span",{id:p,...s("label"),children:d})}),u&&e.jsx("div",{id:y,...s("message"),"data-variant":n,children:u})]}),m&&e.jsx(S,{...s("closeButton"),onClick:_,variant:"transparent",size:16,iconSize:16,"aria-label":B,unstyled:v})]})})});f.classes=x;f.displayName="@mantine/core/Alert";export{f as A};
